

type response_status =
  { code : int
  ; message : string
  }

type requestBody = Web.XMLHttpRequest.body
type bodyType = Web.XMLHttpRequest.responseType
type responseBody = Web.XMLHttpRequest.responseBody

type response =
  { url : string
  ; status : response_status
  ; headers : string Map.Make(String).t
  ; body : responseBody
  }

type error =
  | BadUrl of string
  | Timeout
  | NetworkError
  | Aborted
  | BadStatus of response
  | BadPayload of response

let string_of_error = function
  | BadUrl url -> "Bad Url: " ^ url
  | Timeout -> "Timeout"
  | NetworkError -> "Unknown network error"
  | Aborted -> "Request aborted"
  | BadStatus resp -> "Bad Status: " ^ resp.url
  | BadPayload resp -> "Bad Payload: " ^ resp.url

type header = Header of string * string

type 'res expect =
    Expect of bodyType * (response -> ('res, string) Tea_result.t)

type requestEvents =
  { onreadystatechange : (Web.XMLHttpRequest.event_readystatechange -> unit) option
  ; onprogress : (Web.XMLHttpRequest.event_progress -> unit) option
  }

type 'res rawRequest =
  { method' : string
  ; headers : header list
  ; url : string
  ; body : requestBody
  ; expect : 'res expect
  ; timeout : Tea_time.t option
  ; withCredentials : bool
  }

type 'res request =
    Request of 'res rawRequest * requestEvents option

let expectStringResponse func =
  let open Web.XMLHttpRequest in
  Expect
    ( TextResponseType
    , ( fun { url; status; headers; body } ->
          match body with
          | TextResponse s -> func s
          | _ -> Tea_result.Error "Non-text response returned"
      )
    )


let expectString =
  expectStringResponse (fun resString -> Tea_result.Ok resString)


let request rawRequest =
  Request (rawRequest, None)


let getString url =
  request
    { method' = "GET"
    ; headers = []
    ; url = url
    ; body = EmptyBody
    ; expect = expectString
    ; timeout = None
    ; withCredentials = false
    }


let send resultToMessage (Request (request, maybeEvents)) =
  let module StringMap = Map.Make(String) in
  let {method'; headers; url; body; expect; timeout; withCredentials } = request in
  let (Expect (typ, func)) = expect in
  Tea_cmd.call (fun enqueue ->
      let enqRes result = fun _ev -> enqueue (resultToMessage result) in
      let xhr = Web.XMLHttpRequest.create () in
      let setEvent ev cb = ev cb xhr in
      let () = match maybeEvents with
        | None -> ()
        | Some { onprogress; onreadystatechange } ->
          let open Web.XMLHttpRequest in
          let may thenDo = function
            | None -> ()
            | Some v -> thenDo v in
          let () = may (setEvent set_onreadystatechange) onreadystatechange in
          let () = may (setEvent set_onprogress) onprogress in
          () in
      let () = setEvent Web.XMLHttpRequest.set_onerror (enqRes NetworkError) in
      let () = setEvent Web.XMLHttpRequest.set_ontimeout (enqRes Timeout) in
      let () = setEvent Web.XMLHttpRequest.set_onabort (enqRes Aborted) in
      let () = setEvent Web.XMLHttpRequest.set_onload
          ( fun _ev ->
              let open Web.XMLHttpRequest in
              let headers =
                match getAllResponseHeadersAsDict xhr with
                | Tea_result.Error _e -> StringMap.empty
                | Tea_result.Ok headers -> headers in
              let response =
                { status = { code = get_status xhr; message = get_statusText xhr }
                ; headers = headers
                ; url = get_responseURL xhr
                ; body = get_response xhr
                } in
              ()
          ) in
      let () = try Web.XMLHttpRequest.open_ method' url xhr
        with _ -> enqRes (BadUrl url) () in
      let () =
        let setHeader (Header (k, v)) = Web.XMLHttpRequest.setRequestHeader k v xhr in
        let () = List.iter setHeader headers in
        let () = Web.XMLHttpRequest.set_responseType typ xhr in
        let () =
          match timeout with
          | None -> ()
          | Some t -> Web.XMLHttpRequest.set_timeout t xhr in
        let () = Web.XMLHttpRequest.set_withCredentials withCredentials xhr in
        () in
      let () = Web.XMLHttpRequest.send body xhr in
      ()
    )

module Progress = struct

  type bytesProgressed =
    { bytes : int
    ; bytesExpected : int
    }

  type 'data t =
    | NoProgress
    (* SomeProgress (bytes, bytesExpected) *)
    | SomeProgress of bytesProgressed
    | FailProgress of error
    | DoneProgress of 'data

  type 'msg trackedRequest =
    { request : 'msg rawRequest
    ; toProgress : bytesProgressed -> 'msg
    ; toError : error -> 'msg
    }

  let track id toMessage (Request (request, events)) =
    let open Vdom in
    let key = id in
    let enableCall callbacks =
      let disabled = ref false in
      fun () ->
        disabled := true
    in Tea_sub.registration key enableCall

end

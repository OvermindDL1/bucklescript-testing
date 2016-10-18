

type response_status =
  { code : int
  ; message : string
  }

type 'body response =
  { url : string
  ; status : response_status
  ; headers : string Map.Make(String).t
  ; body : 'body
  }

type error =
  | BadUrl of string
  | Timeout
  | NetworkError
  | BadStatus of string response
  | BadPayload of string response

let string_of_error = function
  | BadUrl url -> "Bad Url: " ^ url
  | Timeout -> "Timeout"
  | NetworkError -> "Unknown network error"
  | BadStatus resp -> "Bad Status: " ^ resp.url
  | BadPayload resp -> "Bad Payload: " ^ resp.url

type header = Header of string * string

type body =
  | EmptyBody
  | StringBody of string * string
  | FormDataBody

type 'a expect = Expect of string * (string response -> ('a, string) result)

type 'a rawRequest =
  { method' : string
  ; headers : header list
  ; url : string
  ; body : body
  ; expect : 'a expect
  ; timeout : Tea_time.t option
  ; withCredentials : bool}

type 'a request = Request of 'a rawRequest


let expectStringResponse func =
  Expect ("text", func)


let expectString =
  expectStringResponse (fun response -> Ok response.body)


let request rawRequest =
  Request rawRequest


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

  let track id toMessage (Request request) =
    let open Vdom in
    let key = id in
    let enableCall callbacks =
      let disabled = ref false in
      fun () ->
        disabled := true
    in Tea_sub.registration key enableCall

end

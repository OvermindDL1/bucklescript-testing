
type ('flags, 'model, 'msg, 'data) navigationProgram =
  { urlUpdate : 'model -> 'data -> 'model * 'msg Tea_cmd.t
  ; init : 'flags -> 'data -> 'model * 'msg Tea_cmd.t
  ; update : 'model -> 'msg -> 'model * 'msg Tea_cmd.t
  ; view : 'model -> 'msg Vdom.t
  ; subscriptions : 'model -> 'msg Tea_sub.t
  ; shutdown : 'model -> 'msg Tea_cmd.t
  }

type 'userMsg msg =
  | Change of Web.Location.location
  | UserMsg of 'userMsg


let getLocation () =
  Web.Location.asRecord (Web.Document.location ())





let notifier : (Web.Location.location -> unit) option ref = ref None

let notifyUrlChange () =
  match !notifier with
  | None -> ()
  | Some cb ->
    let location = getLocation () in
    let () = cb location in
    ()


let subscribe tagger =
  let open Vdom in
  let enableCall callbacks =
    let notifyHandler location =
      callbacks.enqueue (tagger location) in
    let () = notifier := Some notifyHandler in
    let handler : Web.Node.event_cb = fun [@bs] event ->
      notifyUrlChange () in
    let () = Web.Window.addEventListener "popstate" handler false in
    fun () -> Web.Window.removeEventListener "popstate" handler false
  in Tea_sub.registration "navigation" enableCall



let replaceState url =
  Web.Window.History.replaceState Web.Window.window (Js.Json.parse "{}") "" url


let pushState url =
  Web.Window.History.pushState Web.Window.window (Js.Json.parse "{}") "" url


let modifyUrl url =
  Tea_cmd.call (fun enqueue ->
      let () = replaceState url in
      let () = notifyUrlChange () in
      ()
    )


let newUrl url =
  Tea_cmd.call (fun enqueue ->
      let () = pushState url in
      let () = notifyUrlChange () in
      ()
    )


let navigationProgram :
  (Web.Location.location -> 'data) ->
  ('flags, 'model, 'msg, 'data) navigationProgram ->
  Web.Node.t Js.null_undefined -> 'flags -> 'userMsg msg Tea_app.programInterface =
  fun parser {urlUpdate; init; update; view; subscriptions; shutdown} ->

    let init' : 'flags -> 'model * 'userMsg msg Tea_cmd.t = fun flag ->
      let initLocation = getLocation () in
      let model, cmd = init flag (parser initLocation) in
      model, Tea_cmd.map (fun msg -> UserMsg msg) cmd in

    let update' model msg =
      (* let () = Js.log ("Internal update", model, msg) in *)
      let newModel, cmd = match msg with
        | Change location -> urlUpdate model (parser location)
        | UserMsg userMsg -> update model userMsg
      in
        (* let () = Js.log ("Internal update result", newModel, cmd) in *)
      newModel, Tea_cmd.map (fun msg -> UserMsg msg) cmd in

    let wrapUserMsg userMsg = UserMsg userMsg in

    let view' : 'model -> 'msg msg Vdom.t = fun model ->
      let vdom : 'msg Vdom.t = view model in
      let taggedVdom : 'msg msg Vdom.t = Tea_app.map wrapUserMsg vdom in
      taggedVdom in

    let subscriptions' model =
      Tea_sub.batch
        [ subscribe (fun location -> Change location)
        ; Tea_sub.map (fun userMsg -> UserMsg userMsg) (subscriptions model)
        ] in

    let shutdown' model =
      let cmd = shutdown model in
      Tea_cmd.map (fun msg -> UserMsg msg) cmd in

    let open Tea_app in
    program
      { init = init'
      ; update = update'
      ; view = view'
      ; subscriptions = subscriptions'
      ; shutdown = shutdown'
      }

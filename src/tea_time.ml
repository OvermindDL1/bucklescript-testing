

type t = float


(* type 'msg mySub =
  | Every of t * (t -> 'msg)


type 'msg myCmd =
  | Delay of t * (unit -> 'msg) *)


let every interval tagger =
  let open Vdom in
  let key = string_of_int interval in
  let enableCall callbacks =
    let id = (Web.Window.setInterval (fun () -> callbacks.enqueue (tagger (Web.Date.now ())) ) interval) in
    (* let () = Js.log ("Time.every", "enable", interval, tagger, callbacks) in *)
    fun () ->
      (* let () = Js.log ("Time.every", "disable", id, interval, tagger, callbacks) in *)
      Web.Window.clearTimeout id
  in Tea_sub.registration key enableCall


let delay msTime msg =
  Tea_cmd.call (fun enqueue -> let _unhandledID = Web.Window.setTimeout (fun () -> enqueue msg) msTime in ())

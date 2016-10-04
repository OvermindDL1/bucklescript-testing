
type t = float


(* type 'msg mySub =
  | Every of t * (t -> 'msg)


type 'msg myCmd =
  | Delay of t * (unit -> 'msg) *)


let every interval tagger =
  let key = string_of_int interval in
  let state = ref None in
  let enableCall enqueue =
    state := Some (Web.Window.setInterval (fun () -> enqueue (tagger (Web.Date.now ())) ) interval)
  in
  let disableCall enqueue = match !state with
    | None -> ()
    | Some id -> Web.Window.clearTimeout id
  in
  Tea_sub.registration key enableCall disableCall


let delay msTime msg =
  Tea_cmd.call (fun enqueue -> let _unhandledID = Web.Window.setTimeout (fun () -> enqueue msg) msTime in ())

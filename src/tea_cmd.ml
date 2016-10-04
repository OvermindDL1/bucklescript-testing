
type 'msg t =
  | NoCmd
  | Batch of 'msg t list
  | EnqueueCall of (('msg -> unit) -> unit)


type 'msg applicationCallbacks = 'msg Vdom.applicationCallbacks


let none = NoCmd


let batch cmds =
  Batch cmds


let call call =
  EnqueueCall call


let fnMsg fnMsg =
  EnqueueCall (fun enqueue -> enqueue (fnMsg ()))


let msg msg =
  EnqueueCall (fun enqueue -> enqueue msg)


let rec run callbacks =
  let open Vdom in
  function
  | NoCmd -> ()
  | Batch cmds -> List.fold_left (fun () cmd -> run callbacks cmd) () cmds
  | EnqueueCall cb ->
    (* let () = Js.log ("Cmd.run", "enqueue", cb) in *)
    cb !callbacks.enqueue

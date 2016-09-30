
type 'msg t =
  | None
  | Batch of 'msg t list
  | EnqueueCall of (('msg -> unit) -> unit)


let none = None


let batch cmds =
  Batch cmds


let call call =
  EnqueueCall call


let fnMsg fnMsg =
  EnqueueCall (fun enqueue -> enqueue (fnMsg ()))


let msg msg =
  EnqueueCall (fun enqueue -> enqueue msg)


let rec run enqueue = function
  | None -> ()
  | Batch cmds -> List.fold_left (fun () cmd -> run enqueue cmd) () cmds
  | EnqueueCall cb -> let () = Js.log ("Cmd.run", "enqueue", cb) in cb enqueue



type 'msg t =
  | None
  | Batch of 'msg t list
  (* Registration (key, enableCall, disableCall) *)
  | Registration of string * (('msg -> unit) -> unit) * (('msg -> unit) -> unit)


let none = None


let batch subs =
  Batch subs


let registration key enableCall disableCall =
  Registration (key, enableCall, disableCall)



let rec run enqueue oldSub newSub =
  let enable sub = () in (* TODO: Finish enable/disable  *)
  let disable sub = () in
  match oldSub, newSub with
  | None, None -> newSub
  | Batch oldSubs, Batch newSubs ->
    let rec aux idx oldList newList =
      ( match oldList, newList with
        | [], [] -> ()
        | [], newS :: newRest -> let () = enable newS in aux (idx + 1) [] newRest
        | oldS :: oldRest, [] -> let () = disable oldS in aux (idx + 1) [] oldRest
        | oldS :: oldRest, newS :: newRest -> let _res = run enqueue oldS newS in ()
      ) in
    let () = aux 0 oldSubs newSubs in
    newSub
  | Registration (oldKey, oldEnCB, oldDiCB), Registration (newKey, newEnCB, newDiCB) when oldKey = newKey -> newSub
  | oldS, newS ->
    let () = disable oldS in
    let () = enable newS in
    newSub
  (* | Batch subs -> List.fold_left (fun () cmd -> run enqueue cmd) () subs
  | EnqueueCall cb -> let () = Js.log ("Cmd.run", "enqueue", cb) in cb enqueue *)

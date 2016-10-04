

type 'msg t =
  | NoSub
  | Batch of 'msg t list
  (* Registration (key, enableCall, disableCall) *)
  | Registration of string * ('msg Vdom.applicationCallbacks ref -> (unit -> unit)) * (unit -> unit) option ref


type 'msg applicationCallbacks = 'msg Vdom.applicationCallbacks


let none = NoSub


let batch subs =
  Batch subs


let registration key enableCall =
  Registration (key, (fun callbacks -> enableCall !callbacks), ref None)



let rec run callbacks oldSub newSub =
  let rec enable = function
      | NoSub -> ()
      | Batch [] -> ()
      | Batch subs -> List.fold_left (fun () sub -> enable sub) () subs
      | Registration (_key, enCB, diCB) -> diCB := Some (enCB callbacks)
  in let rec disable = function
      | NoSub -> ()
      | Batch [] -> ()
      | Batch subs -> List.fold_left (fun () sub -> disable sub) () subs
      | Registration (_key, _enCB, diCB) ->
        match !diCB with
        | None -> ()
        | Some cb -> cb ()
  in match oldSub, newSub with
  | NoSub, NoSub -> newSub
  | Batch oldSubs, Batch newSubs ->
    let rec aux idx oldList newList =
      ( match oldList, newList with
        | [], [] -> ()
        | [], newS :: newRest -> let () = enable newS in aux (idx + 1) [] newRest
        | oldS :: oldRest, [] -> let () = disable oldS in aux (idx + 1) [] oldRest
        | oldS :: oldRest, newS :: newRest -> let _res = run callbacks oldS newS in ()
      ) in
    let () = aux 0 oldSubs newSubs in
    newSub
  | Registration (oldKey, oldEnCB, oldDiCB), Registration (newKey, newEnCB, newDiCB) when oldKey = newKey ->
    let () = newDiCB := !oldDiCB in (* Don't forget to pass along the cache! *)
    newSub
  | oldS, newS ->
    let () = disable oldS in
    let () = enable newS in
    newSub

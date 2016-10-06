

type 'msg t =
  | NoSub
  | Batch of 'msg t list
  (* Registration (key, enableCall, disableCall) *)
  | Registration of string * ('msg Vdom.applicationCallbacks ref -> (unit -> unit)) * (unit -> unit) option ref
  | Tagger of ('msg Vdom.applicationCallbacks ref -> 'msg Vdom.applicationCallbacks ref) * 'msg t


type 'msg applicationCallbacks = 'msg Vdom.applicationCallbacks


let none = NoSub


let batch subs =
  Batch subs


let registration key enableCall =
  Registration (key, (fun callbacks -> enableCall !callbacks), ref None)



(*
let rec map func = function
  | NoSub -> NoSub
  | Batch subs -> Batch (List.map (map func) subs)
  | Registration (key, enableCall, disableCall) -> Registration (key, (fun callbacks -> (* TODO:  Need to wrap enqueue in the callbacks... *)), disableCall)
*)



let rec run callbacks oldSub newSub =
  let rec enable callbacks = function
      | NoSub -> ()
      | Batch [] -> ()
      | Batch subs -> List.fold_left (fun () sub -> enable callbacks sub) () subs
      | Tagger (tagger, sub) -> enable (tagger callbacks) sub
      | Registration (_key, enCB, diCB) -> diCB := Some (enCB callbacks)
  in let rec disable = function
      | NoSub -> ()
      | Batch [] -> ()
      | Batch subs -> List.fold_left (fun () sub -> disable sub) () subs
      | Tagger (tagger, sub) -> disable sub
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
        | [], newS :: newRest -> let () = enable callbacks newS in aux (idx + 1) [] newRest
        | oldS :: oldRest, [] -> let () = disable oldS in aux (idx + 1) [] oldRest
        | oldS :: oldRest, newS :: newRest -> let _res = run callbacks oldS newS in ()
      ) in
    let () = aux 0 oldSubs newSubs in
    newSub
  | Registration (oldKey, oldEnCB, oldDiCB), Registration (newKey, newEnCB, newDiCB) when oldKey = newKey ->
    let () = newDiCB := !oldDiCB in (* Don't forget to pass along the cache! *)
    newSub
  | Tagger (oldTagger, oldSub), Tagger (newTagger, newSub) ->
    run (newTagger callbacks) oldSub newSub
  | oldS, newS ->
    let () = disable oldS in
    let () = enable callbacks newS in
    newSub


let wrapCallbacks func callbacks =
  let open Vdom in
  ref
    { enqueue = (fun msg -> !callbacks.enqueue (func msg))
    }

let map : ('a -> 'b) -> 'a t -> 'b t = fun func vdom ->
  let tagger callbacks =
    let open Vdom in
    ref
      { enqueue = (fun msg -> !callbacks.enqueue (func msg))
      } in
  Tagger (Obj.magic tagger, Obj.magic vdom) (* Perhaps an explicit polymorphic type in a record might help here, unsure if it would on the vdom part... *)

(* let map : ('a -> 'b) -> 'a t -> 'b t = fun func cmd ->
  let open Vdom in
  Tagger
    ( fun callbacks ->
        run (Tea_cmd.wrapCallbacks func callbacks) cmd
    ) *)

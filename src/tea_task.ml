
type ('fail, 'succeed) t =
  | Succeed of 'succeed
  | Fail of 'fail
  | AndThen of ('fail, 'succeed) t * ('succeed -> unit)
  | OnError of ('fail, 'succeed) t * ('fail -> unit)


let succeed value =
  Succeed value


let fail value =
  Fail value


let andThen _fn task =
  let handler _succ = ()
    in
  AndThen (task, handler)


let onError fn task =
  OnError (task, fn)


(* let testing =
  succeed 42
  |> onError (fun () -> succeed "stringy") *)

(* "OAK-TEA" Maybe?  For OCaml Application Kernal TEA *)

module type Program = sig
  type flags
  type model
  type msg
  val init : flags -> model
  val update : model -> msg -> model * Cmd.t
  val subscriptions : model -> int
  (* val view : model -> msg Vdom.t *)
end

(* type 'flags 'model testRec = {
  init : 'flags -> 'model
} *)

type ('model, 'msg) myRec = {
  model : 'model;
  view : 'model -> 'msg Vdom.t;
  update : 'model -> 'msg -> 'model;
}

let programWithFlags program = function
  | None -> Js.log 42
  | Some parentNode -> Js.log 84


(* let beginnerProgram program = function
  | None -> Js.log 42
  | Some parentNode -> Js.log 84 *)

let beginnerProgram program =
  42


(*
module type ProgramState = sig
end

module MakeProgram (Prog : Program) : ProgramState = struct
  (* module Program = Prog *)
end

let makeProgram p =
  let module P = (val p : Program) in
  (module struct
    let x = P.init
    let y = 42
  end : ProgramState)


module type Main = sig
end

module type App = sig
end

(*
module Make (Prog : Program) : App = struct
  (* let x = M.x + 1 *)
end *)

module Make (MainProg : Main) : App = struct
  (* let x = M.x + 1 *)
end

(* let programWithFlags (module Prog : Program) =
  42 *) *)

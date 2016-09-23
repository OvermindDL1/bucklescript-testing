(* "OAK-TEA" Maybe?  For OCaml Application Kernal-TEA *)

module type Program = sig
  type flags
  type model
  type msg
  val init : flags -> model
  val update : model -> msg -> model * Cmd.t
  val view : model -> msg Vdom.t
end


module type App = sig

end

module Make (Prog : Program) : App = struct
  (* let x = M.x + 1 *)
end


open Tea.App

type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int

let update model =
  let () = Js.log "Update called" in
  function
  | Increment -> model + 1
  | Decrement -> model - 1
  | Reset -> 0
  | Set v -> v

open Vdom

let view_button title ?key msg =
  node "button"
    [ match key with
      | None -> on "click" (fun ev -> let () = Js.log ("Event", ev, msg) in msg)
      | Some k -> onKey "click" k (fun ev -> let () = Js.log ("EventKeyed", ev, msg) in msg)
    ]
    [ text title
    ]

let view model =
  let () = Js.log "View called" in
  node "div"
    []
    [ node "span"
        [ style "text-weight" "bold" ]
        [ text (string_of_int model) ]
    ; node "br" [] []
    ; view_button "Increment" Increment
    ; node "br" [] []
    (* ; view_button "Decrement" ~key:(if model = 1 then "1" else "") (if model = 1 then Increment else Decrement) *)
    ; view_button "Decrement" Decrement
    ; node "br" [] []
    ; view_button "Set to 42" (Set 42)
    ; node "br" [] []
    ; if model <> 0 then view_button "Reset" Reset else noNode
    ]


let main =
  beginnerProgram {
    model = 4;
    update;
    view;
  }

let m = main (Web.Document.getElementById "content")

(* let () =
  Js.log "inited";
  Js.log "Resetting";
  m Reset;
  Js.log "Increment";
  m Increment;
  Js.log "Increment";
  m Increment;
  Js.log "Set";
  m (Set 42); *)

(* let main =
  beginnerPrograms (Js.Null_undefined.return (Web.Document.body ()))
  (* beginnerPrograms (Js.Null_undefined.return (Web.Document.body ())) *) *)


(*
let res =
  for i = 0 to 10 do
    Js.log (Fib.fib i)
  done

module type X_int = sig val x : int end

module Increment (M : X_int) : X_int = struct
  let x = M.x + 1
end

module Three = struct let x = 3 end

module Four = Increment(Three)

module Five = Increment(Four)

let inc_test = Four.x + Five.x
*)

(*
let view_test =
  let model = { count = 42; more = "" } in
  view model

let renderTest =
  let v = view_test in
  renderToHtmlString v

let () = Js.log (renderToHtmlString view_test)

let elem = createElementFromVNode view_test

let attachedElem = match Js.Null.to_opt (Web.Document.getElementById "content") with
  | None -> Js.log "Failed to attach"
  | Some e -> let attached = Web.Node.appendChild e elem in Js.log attached
*)

(* let main p =
  let module P = (val (Tea_app.makeProgram p) : Tea_app.ProgramState) in
  P.x *)


(* module CounterApp = module Tea.App.MakeProgram Counter *)

(* module App =
  Tea.App.Make (struct

  end) *)


(* module Main = App.Make (struct
    type flags = unit

    type model =
      { count : int
      }

    type msg =
      | Increment
      | Decrement
      | Reset
      | Set of int
  end) *)

(* let _ = App.main struct
          type t = int
        end *)

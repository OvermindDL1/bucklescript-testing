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

type model =
  { count : int
  }

type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int

let init () = { count = 0 }

let update model = function
  | Increment -> { model with count = model.count + 1 }, Cmd.none
  | Decrement -> { model with count = model.count - 1 }, Cmd.none
  | Reset -> { model with count = 0 }, Cmd.none
  | Set v -> { model with count = v }, Cmd.none

open Vdom

let view_button title msg =
  node "button"
    [ on "click" (fun ev -> msg)
    ]
    [ text title
    ]

let view model =
  node "div"
    []
    [ node "span"
         [ style "text-weight" "bold" ]
         [ text (string_of_int model.count) ]
    ; view_button "Increment" Increment
    ; view_button "Decrement" Decrement
    ; if model.count <> 0 then view_button "Reset" Reset else noNode
    ; view_button "Set to 42" (Set 42)
    ]


let view_test =
  let model = { count = 42 } in
  view model

let renderTest =
  let v = view_test in
  renderToHtmlString v

let () = Js.log (renderToHtmlString view_test)

let elem = createElementFromVNode view_test

let attachedElem = match Js.Null.to_opt (Web.document##getElementById "content") with
  | None -> Js.log "Failed to attach"
  | Some e -> let attached = e##appendChild elem in Js.log attached



let main = 42

(* open Tea

module Main = App.Make (struct
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

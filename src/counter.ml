(*
type model =
  { count : int
  ; more : string
  }

type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int

let init () = { count = 0; more = "" }

let update model = function
  | Increment -> { model with count = model.count + 1 }, Cmd.none
  | Decrement -> { model with count = model.count - 1 }, Cmd.none
  | Reset -> { model with count = 0 }, Cmd.none
  | Set v -> { model with count = v }, Cmd.none

open Vdom

let view_button title msg =
  node "button"
    [ on "click" (fun ev -> let () = Js.log [|"Event", ev, msg|] in Some msg)
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
    ] *)

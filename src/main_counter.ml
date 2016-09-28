
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
      | None -> on "click" (fun ev -> let () = Js.log ("Event", ev, msg) in Some msg)
      | Some k -> on "click" ~key:k (fun ev -> let () = Js.log ("EventKeyed", ev, msg) in Some msg)
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

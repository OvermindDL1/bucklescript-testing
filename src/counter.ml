
open Tea.Html


type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int


type model = int


let init () = 4


let update model = function
  | Increment -> model + 1
  | Decrement -> model - 1
  | Reset -> 0
  | Set v -> v


let view_button title ?(key="") msg =
  button
    [ onClick ~key:key msg
    ]
    [ text title
    ]

let view lift model =
  div
    [ styles [("display","inline-block"); ("vertical-align","top")] ]
    [ span
        [ style "text-weight" "bold" ]
        [ text (string_of_int model) ]
    ; br []
    ; view_button "Increment" (lift Increment)
    ; br []
    ; view_button "Decrement" (lift Decrement)
    ; br []
    ; view_button "Set to 42" (lift (Set 42))
    ; br []
    ; if model <> 0 then view_button "Reset" (lift Reset) else noNode
    ]

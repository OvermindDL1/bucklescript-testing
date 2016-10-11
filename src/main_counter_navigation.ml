
open Tea
open Html

type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int
  | OnUrlChange of int option



let toUrl count =
  "#/" ^ string_of_int count


let fromUrl url =
  try Some (int_of_string (String.sub url 2 (String.length url - 2)))
  with _ -> None


let update model = function
  | Increment -> model + 1, Navigation.newUrl (toUrl (model + 1))
  | Decrement -> model - 1, Navigation.newUrl (toUrl (model - 1))
  | Reset -> 0, Navigation.newUrl (toUrl 0)
  | Set v -> v, Navigation.newUrl (toUrl v)
  | OnUrlChange loc -> match loc with
    | None -> 0, Navigation.modifyUrl (toUrl 0)
    | Some v -> v, Cmd.none


let view_button title msg =
  button
    [ onClick msg
    ]
    [ text title
    ]

let view model =
  div
    []
    [ span
        [ style "text-weight" "bold" ]
        [ text (string_of_int model) ]
    ; br []
    ; view_button "Increment" Increment
    ; br []
    ; view_button "Decrement" Decrement
    ; br []
    ; view_button "Set to 42" (Set 42)
    ; br []
    ; if model <> 0 then view_button "Reset" Reset else noNode
    ]


let locationToMessage location =
  let open Web.Location in
  OnUrlChange (fromUrl location.hash)


let init () location =
  let open Web.Location in
  match fromUrl location.hash with
  | None -> 0, Navigation.modifyUrl (toUrl 0)
  | Some v -> v, Cmd.none


let main =
  let open Navigation in
  navigationProgram locationToMessage
    { init
    ; update
    ; view
    ; subscriptions = (fun model -> Sub.none)
    ; shutdown = (fun model -> Cmd.none)
  }

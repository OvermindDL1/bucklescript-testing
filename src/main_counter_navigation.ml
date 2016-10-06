
open Tea
open Html

type msg =
  | Increment
  | Decrement
  | Reset
  | Set of int



let toUrl count =
  "#/" ^ string_of_int count


let fromUrl url =
  try Some (int_of_string (String.sub url 2 (String.length url - 2)))
  with _ -> None


let update model msg =
  let newModel = match msg with
    | Increment -> model + 1
    | Decrement -> model - 1
    | Reset -> 0
    | Set v -> v
  in
  (* newModel, Navigation.newUrl (toUrl newModel) *)
  model, Navigation.newUrl (toUrl newModel)


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


let urlParser location =
  let open Web.Location in
  (* let () = Js.log ("urlParser", location, location.hash, fromUrl location.hash) in *)
  fromUrl location.hash


let urlUpdate model = function
  | None ->
    (* let () = Js.log ("urlUpdate None", model) in *)
    model, Navigation.modifyUrl (toUrl model)
  | Some newCount ->
    (* let () = Js.log ("urlUpdate Some", newCount, model) in *)
    newCount, Cmd.none


let init () result =
  urlUpdate 0 result

let main =
  let open Navigation in
  navigationProgram urlParser
    { urlUpdate
    ; init
    ; update
    ; view
    ; subscriptions = (fun model -> Sub.none)
    ; shutdown = (fun model -> Cmd.none)
  }


open Tea
open App
open Html

type model =
  { r : int
  ; g : int
  ; b : int
  }


type msg =
  | Roll
  | NewColor of int * int * int


let init () = { r=255; g=255; b=255 }, Cmd.none


let update model = function
  | Roll ->
    let genInt = Tea.Random.int 1 255 in
    (* Here is how to do it via a list *)
    (* let genList3 = Tea.Random.list 3 genInt in
       model, Tea.Random.generate (function |[r;g;b] -> NewColor (r,g,b) | v -> failwith "will never happen") genList3 *)
    (* And here is how to do it via a mapping *)
    let genTuple3 = Tea.Random.map3 (fun r g b -> NewColor (r,g,b)) genInt genInt genInt in
    model, Tea.Random.generate (fun v->v) genTuple3
  | NewColor (r, g, b) -> { r; g; b }, Cmd.none


let subscriptions model =
  Sub.none


let view model =
  let r = (string_of_int model.r) in
  let g = (string_of_int model.g) in
  let b = (string_of_int model.b) in
  let isDark = (model.r + model.g + model.b) / 3 > 128 in
  let rgb = "("^r^","^g^","^b^")" in
  let altRgb = if isDark then
      "(0,0,0)"
    else
      "(255,255,255)"
      in
  div []
    [ h1 [ style "background-color" ("rgb"^rgb); style "color" ("rgb"^altRgb) ]
        [ text rgb ]
    ; button [ onClick Roll ] [ text "Roll" ]
    ]


let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

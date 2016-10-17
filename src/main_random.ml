
open Tea
open App
open Html

type model =
  { dieFace : int
  }


type msg =
  | Roll
  | NewFace of int


let init () = { dieFace = 1 }, Cmd.none


let update model = function
  | Roll -> model, Tea.Random.generate (fun v -> NewFace v) (Tea.Random.int 1 6)
  | NewFace dieFace -> { dieFace }, Cmd.none


let subscriptions _model =
  Sub.none


let view model =
  div []
    [ h1 [] [ text (string_of_int model.dieFace) ]
    ; button [ onClick Roll ] [ text "Roll" ]
    ]


let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }


(* https://gist.github.com/pablohirafuji/fa373d07c42016756d5bca28962008c4 *)

open Tea
module Progress = Http.Progress


type model =
  { progress : string Progress.t
  ; bookUrl : string option
  ; bookContent : string
  }


let initModel =
  { progress = Progress.NoProgress
  ; bookUrl = None
  ; bookContent = ""
  }


let init () =
  initModel, Cmd.none


type msg =
  | NoOp
  | GetBook of string
  | GetBookProgress of string Progress.t
(* [@@deriving variants] *)


let subscriptions model =
  match model.bookUrl with
  | None -> Sub.none
  | Some bookUrl ->
    Http.getString bookUrl
    |> Http.Progress.track bookUrl (fun progress -> GetBookProgress progress)
    (* |> Http.Progress.track bookUrl getBookProgress *)


let update model = function
  | NoOp -> model, Cmd.none

  | GetBook url ->
    { model with bookUrl = Some url }, Cmd.none

  | GetBookProgress (Progress.DoneProgress bookContent) ->
    { model
      with progress = Progress.DoneProgress ""
         ; bookContent
    }, Cmd.none

  | GetBookProgress (Progress.FailProgress error) ->
    { model
      with progress = Progress.FailProgress error
         ; bookContent = Http.string_of_error error
    }, Cmd.none

  | GetBookProgress progress ->
    { model with progress }, Cmd.none



let viewStyle =
  let open Html in
  styles
    [ ("display", "flex")
    ; ("flex-direction", "column")
    ; ("width", "550px")
    ; ("margin", "0 auto")
    ; ("font-family", "Arial")
    ]


let bookTextViewStyle =
  let open Html in
  styles
    [ ("height", "400px")
    ; ("width", "100%")
    ]


let inputRadio labelText url =
  let open Html in
  div []
    [ label
        [ onCheck (fun isChecked ->
              if isChecked
              then GetBook url
              else NoOp
            )
        ]
        [ input' [ type' "radio"; name "book-radio" ] []
        ; text labelText
        ]
    ]


let progressView loaded =
  let open Html in
  div []
    [ span [] [ text "Progress: " ]
    ; progress
        [ value loaded
        ; Attributes.max "100"
        ]
        [ text (loaded ^ "%") ]
    ; text (loaded ^ "%")
    ]


let progressLoaded = let open Progress in function
    | DoneProgress _ -> 100
    | SomeProgress { bytes; bytesExpected } ->
      ((bytes * 100) / (bytesExpected * 100))
    | NoProgress | FailProgress _ -> 0 


let footerView =
  let open Html in
  span []
    [ text "Books from "
    ; a [ href "http://www.gutenberg.org/"
        ; target "_blank"
        ]
        [ text "Project Gutenberg"]
    ]


let bookTextView valueText =
  let open Html in
  div []
    [ textarea
        [ value valueText
        ; Attributes.disabled true
        ; bookTextViewStyle
        ]
        []
    ]


let view model =
  let open Html in
  div [ viewStyle ]
    [ h1 [] [ text "Book Reader" ]
    ; p []
        [ text "Select a book:"
        ; inputRadio "Essays - Ralph Waldo Emerson" "https://s3-sa-east-1.amazonaws.com/estadistas/Essays-Ralph-Waldo-Emerson.txt"
        ; inputRadio "Leviathan - Thomas Hobbes" "https://s3-sa-east-1.amazonaws.com/estadistas/Leviathan.txt"
        ; inputRadio "The Ethics of Aristotle - Aristotle" "https://s3-sa-east-1.amazonaws.com/estadistas/The-Ethics-of+Aristotle.txt"
        ]
    ; progressView (string_of_int (progressLoaded model.progress))
    ; bookTextView model.bookContent
    ; footerView
    ]


let main =
  let open App in
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

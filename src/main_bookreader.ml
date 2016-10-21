
(* https://gist.github.com/pablohirafuji/fa373d07c42016756d5bca28962008c4 *)

open Tea
module Progress = Http.Progress


type model =
  { progress : Progress.t
  ; bookUrl : string option
  ; bookContent : string
  }


let initModel =
  { progress = Progress.emptyProgress
  ; bookUrl = None
  ; bookContent = ""
  }


let init () =
  initModel, Cmd.none


type msg =
  | NoOp
  | GetBook of string
  | GetBookProgress of string * Progress.t
  | GetBookDone of string * string


let subscriptions _model =
  Sub.none


let progressHelper b =
  let open Progress in
  { bytes = b; bytesExpected = 1}

let update model = function
  | NoOp -> model, Cmd.none

  | GetBook url ->
    let httpCmd =
      Http.getString url
      |> Http.Progress.track (fun progress -> GetBookProgress (url, progress))
      |> Http.send
        ( function
          | Result.Error _e -> NoOp
          | Result.Ok output -> GetBookDone (url, output)
        ) in
    { model with
      bookUrl = Some url
    ; progress = progressHelper 0
    }, httpCmd

  | GetBookProgress (url, progress) ->
    if (Some url) <> model.bookUrl then model, Cmd.none else
      { model with progress }, Cmd.none

  | GetBookDone (url, bookContent) ->
    if (Some url) <> model.bookUrl then model, Cmd.none else
      { model with bookContent; progress = progressHelper 1 }, Cmd.none



let viewStyle =
  let open Html in
  styles
    [ ("display", "flex")
    ; ("flex-direction", "column")
    ; ("width", "100%")
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


let progressLoaded progress =
  let open Progress in
  let bytes = float_of_int progress.bytes in
  let bytesExpected = float_of_int progress.bytesExpected in
  if bytesExpected <= 0.0 then 100
  else int_of_float (100.0 *. (bytes /. bytesExpected))


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

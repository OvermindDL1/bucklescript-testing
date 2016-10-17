
open Tea.App
open Tea.Html


type msg =
  | NewContent of string


let update _oldContent (NewContent content) =
  content


let myStyle =
  styles
    [ ("width", "100%")
    ; ("height", "40px")
    ; ("padding", "10px 0")
    ; ("font-size", "2em")
    ; ("text-align", "center")
    ]

let view content =
  let string_rev s =
    let len = String.length s in
    String.init len (fun i -> s.[len - 1 - i]) in
  div []
    [ input' [ placeholder "Text to reverse"; onInput (fun s -> NewContent s); myStyle ] []
    ; div [ myStyle ] [ text (string_rev content) ]
    ]


let main =
  beginnerProgram { model = ""; view; update }

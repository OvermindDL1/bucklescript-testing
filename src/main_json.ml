open Tea

type model = string

type msg =
  | NewContent of string

let update _oldContent (NewContent content) =
  content


let myStyle =
  let open Html in
  styles
    [ ("width", "100%")
    ; ("height", "100px")
    ; ("padding", "10px 0")
    ]

let view jsonString =
  let open Html in
  let decoder =
    let open Json.Decoder in
    keyValuePairs string in
  let kvPairsResult = Json.Decoder.decodeString decoder jsonString in
  let reEncoded = match kvPairsResult with
    | Tea.Result.Error _ -> ""
    | Tea.Result.Ok v ->
      let encoded =
        let open Json.Encoder in
        object_ (List.map (fun (k, v) -> (k, string v)) v)
      in Json.Encoder.encode 2 encoded in
  let newEncoded =
    let encoded =
      let open! Json.Encoder in
      object_
        [ ("string", string "a string")
        ; ("int", int 42)
        ; ("float", float 3.14)
        ; ("object", object_ [ ("sub", string "object") ])
        ; ("array", array [|int 1; string "2"|])
        ; ("list", list [int 1; string "2"])
        ; ("boolean", bool true)
        ; ("null", null)
        ]
    in Json.Encoder.encode 2 encoded in
  let newReEncoded =
    let decoder =
      let mapper s i f os a0 l1 b n =
        String.concat "\n"
          [ s
          ; string_of_int i
          ; string_of_float f
          ; os
          ; string_of_int a0
          ; l1
          ; string_of_bool b
          ; n
          ] in
      let open! Json.Decoder in
      map8 mapper
        (field "string" string)
        (field "int" int)
        (field "float" float)
        (at ["object"; "sub"] string)
        (field "array" (index 0 int))
        (field "list" (index 1 string))
        (field "boolean" bool)
        (field "null" (null "null"))
    in Json.Decoder.decodeString decoder newEncoded in
  let newReEncodedString =
    match newReEncoded with
    | Tea.Result.Ok s -> s
    | Tea.Result.Error e -> "ERROR:  " ^ e in
  div []
    [ textarea
        [ placeholder "Put JSON string here that fullfills being an object of strings"
        ; onInput (fun a -> NewContent a)
        ; myStyle
        ] []
    ; div [ myStyle ]
        ( match kvPairsResult with
          | Tea.Result.Ok v ->
            List.fold_left
              (fun p (k, v) -> text (k ^ ": " ^ v) :: br [] :: p)
              [text "Values:"]
              v
            |> List.rev
          | Tea.Result.Error e -> [ text ("ERROR: " ^ e) ]
        )
    ; div [ myStyle ]
        [ text "Encoded again:"
        ; br []
        ; pre [] [ text reEncoded ]
        ; br []
        ; text "Encoding an object of various things to test:"
        ; br []
        ; pre [] [ text newEncoded ]
        ; br []
        ; text "Parsing out parts of the encoded test object from the json string"
        ; br []
        ; pre [] [ text newReEncodedString ]
        ]
    ]

let main =
  let open App in
  beginnerProgram { model = ""; view; update }

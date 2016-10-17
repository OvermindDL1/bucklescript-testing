
(* https://github.com/evancz/react-angular-ember-elm-performance-comparison/blob/master/implementations/elm-0.17/Todo.elm *)
open Tea
open App
open Html




(* MODEL *)

type entry =
  { description : string
  ; completed : bool
  ; editing : bool
  ; id : int
  }

(* The full application state of our todo app. *)
type model =
  { entries : entry array
  ; field : string
  ; uid : int
  ; visibility : string
  }


let emptyModel =
  { entries = [||]
  ; visibility = "All"
  ; field = ""
  ; uid = 0
  }

let newEntry desc id =
  { description = desc
  ; completed = false
  ; editing = false
  ; id = id
  }

let init () =
  emptyModel, Cmd.none


(* UPDATE *)

(* Users of our app can trigger messages by clicking and typing. These
messages are fed into the `update` function as they occur, letting us react
to them. *)
type msg =
  | NoOp
  | UpdateField of string
  | EditingEntry of int * bool
  | UpdateEntry of int * string
  | Add
  | Delete of int
  | DeleteComplete
  | Check of int * bool
  | CheckAll of bool
  | ChangeVisibility of string


(* How we update our Model on a given Msg? *)
let update model = function
  | NoOp -> model, Cmd.none

  | Add ->
    { model with
      uid = model.uid + 1;
      field = "";
      entries =
        if model.field = "" then
          model.entries
        else
          Array.concat [ model.entries; [|newEntry model.field model.uid|] ]
    }, Cmd.none

  | UpdateField field -> { model with field }, Cmd.none

  | EditingEntry (id, editing) ->
    let updateEntry t =
      if t.id = id then { t with editing } else t
    in { model with
         entries = Array.map updateEntry model.entries
       }, if editing then Cmds.focus ("todo-" ^ string_of_int id) else Cmd.none

  | UpdateEntry (id, description) ->
    let updateEntry t =
      if t.id = id then { t with description } else t
    in { model with
         entries = Array.map updateEntry model.entries
       }, Cmd.none

  | Delete id ->
    { model with
      entries = List.filter (fun t -> t.id <> id) (Array.to_list model.entries) |> Array.of_list
    }, Cmd.none

  | DeleteComplete ->
    { model with
      entries = List.filter (fun {completed;_} -> not completed) (Array.to_list model.entries) |> Array.of_list
    }, Cmd.none

  | Check (id, completed) ->
    let updateEntry t =
      if t.id = id then { t with completed } else t
    in { model with
         entries = Array.map updateEntry model.entries
       }, Cmd.none

  | CheckAll completed ->
    let updateEntry t =
      { t with completed }
    in { model with
         entries = Array.map updateEntry model.entries
       }, Cmd.none
  | ChangeVisibility visibility ->
    { model with visibility }, Cmd.none



(* View rendering *)

let onEnter ?(key="") msg =
  let tagger ev = match ev##keyCode with
    | 13 -> Some msg
    | _ -> None
  in
  on "keydown" ~key:key tagger


let viewEntry todo =
  let key = string_of_int todo.id in
  li
    [ classList
        [ ("completed", todo.completed)
        ; ("editing", todo.editing)
        ]
    ]
    [ div
        [ class' "view" ]
        [ input'
            [ class' "toggle"
            ; type' "checkbox"
            ; checked todo.completed
            ; onClick ~key:(key ^ string_of_bool todo.completed) (Check (todo.id, not todo.completed))
            ]
            []
        ; label
            [ onDoubleClick ~key:key (EditingEntry (todo.id, true)) ]
            [ text todo.description ]
        ; button
            [ class' "destroy"
            ; onClick ~key:key (Delete todo.id)
            ]
            []
        ]
    ; input'
        [ class' "edit"
        ; value todo.description
        ; name "title"
        ; id ("todo-" ^ string_of_int todo.id)
        ; onInput ~key:key (fun value -> UpdateEntry (todo.id, value))
        ; onBlur ~key:key (EditingEntry (todo.id, false))
        ; onEnter ~key:key (EditingEntry (todo.id, false))
        ]
        []
    ]


let viewEntries visibility entries =
  let isVisible todo =
    match visibility with
    | "Completed" -> todo.completed
    | "Active" -> not todo.completed
    | _ -> true in
  let allCompleted =
    Array.fold_left (fun b {completed;_} -> b && completed) true entries in
  let cssVisibility =
    if Array.length entries = 0 then "hidden" else "visible" in
  section
    [ class' "main"
    ; style "visibility" cssVisibility
    ]
    [ input'
        [ class' "toggle-all"
        ; type' "checkbox"
        ; name "toggle"
        ; checked allCompleted
        ; onClick ~key:(string_of_bool allCompleted) (CheckAll (not allCompleted))
        ]
        []
    ; label
        [ for' "toggle-all" ]
        [ text "Mark all as complete" ]
    ; ul [ class' "todo-list" ] (List.map viewEntry (List.filter isVisible (Array.to_list entries)))
    ]


let viewInput task =
  header
    [ class' "header" ]
    [ h1 [] [ text "todos" ]
    ; input'
        [ class' "new-todo"
        ; placeholder "What needs to be done?"
        ; autofocus true
        ; value task
        ; name "newTodo"
        ; onInput (fun str -> (UpdateField str))
        ; onEnter Add
        ]
        []
    ]


let viewControlsCount entriesLeft =
  let item_ =
    if entriesLeft == 1 then " item" else " items" in
  span
    [ class' "todo-count" ]
    [ strong [] [ text (string_of_int entriesLeft) ]
    ; text (item_ ^ " left")
    ]


let visibilitySwap uri visibility actualVisibility =
  li
    [ onClick ~key:visibility (ChangeVisibility visibility) ]
    [ a [ href uri; classList [("selected", visibility = actualVisibility)] ]
        [ text visibility ]
    ]


let viewControlsFilters visibility =
  ul
    [ class' "filters" ]
    [ visibilitySwap "#/" "All" visibility
    ; text " "
    ; visibilitySwap "#/active" "Active" visibility
    ; text " "
    ; visibilitySwap "#/completed" "Completed" visibility
    ]


let viewControlsClear entriesCompleted =
  button
    [ class' "clear-completed"
    ; hidden (entriesCompleted == 0)
    ; onClick DeleteComplete
    ]
    [ text ("Clear completed (" ^ string_of_int entriesCompleted ^ ")")
    ]


let viewControls visibility entries =
  let entriesCompleted =
    Array.fold_left (fun c {completed;_} -> if completed then c + 1 else c) 0 entries in
  let entriesLeft =
    Array.length entries - entriesCompleted in
  footer
    [ class' "footer"
    ; hidden (Array.length entries = 0)
    ]
    [ viewControlsCount entriesLeft
    ; viewControlsFilters visibility
    ; viewControlsClear entriesCompleted
    ]


let infoFooter =
  footer [ class' "info" ]
    [ p [] [ text "Double-click to edit a todo" ]
    ; p []
        [ text "Written by "
        ; a [ href "https://github.com/evancz" ] [ text "Evan Czaplicki" ]
        ; text " and converted by "
        ; a [ href "https://github.com/overminddl1" ] [ text "OvermindDL1" ]
        ]
    ; p []
    [ text "Part of "
    ; a [ href "http://todomvc.com" ] [ text "TodoMVC" ]
    ]
]


let view model =
  div
    [ class' "todomvc-wrapper"
    ; style "visibility" "hidden"
    ]
    [ section
      [ class' "todoapp" ]
      [ viewInput model.field
      ; viewEntries model.visibility model.entries
      ; viewControls model.visibility model.entries
      ]
    ; infoFooter
    ]

















(*
let array_viewEntry todo =
  let open Vdom in
  let key = string_of_int todo.id in
  arraynode "" "li" "" ""
    [| classList
        [ ("completed", todo.completed)
        ; ("editing", todo.editing)
        ]
    |]
    [| arraynode "" "div" "" ""
         [| class' "view" |]
         [| arraynode "" "input" "" ""
              [| class' "toggle"
            ; type' "checkbox"
            ; checked todo.completed
            ; onClick ~key:(key ^ string_of_bool todo.completed) (Check (todo.id, not todo.completed))
              |]
              [||]
        ; arraynode "" "label" "" ""
            [| onDoubleClick ~key:key (EditingEntry (todo.id, true)) |]
            [| text todo.description |]
        ; arraynode "" "button" "" ""
            [| class' "destroy"
            ; onClick ~key:key (Delete todo.id)
            |]
            [||]
         |]
    ; arraynode "" "input" "" ""
        [| class' "edit"
        ; value todo.description
        ; name "title"
        ; id ("todo-" ^ string_of_int todo.id)
        ; onInput ~key:key (fun value -> UpdateEntry (todo.id, value))
        ; onBlur ~key:key (EditingEntry (todo.id, false))
        ; onEnter ~key:key (EditingEntry (todo.id, false))
        |]
        [||]
    |]

let array_viewEntries visibility entries =
  let open Vdom in
  let isVisible todo =
    match visibility with
    | "Completed" -> todo.completed
    | "Active" -> not todo.completed
    | _ -> true in
  let allCompleted =
    Array.fold_left (fun b {completed} -> b && completed) true entries in
  let cssVisibility =
    if Array.length entries = 0 then "hidden" else "visible" in
  arraynode "" "section" "" ""
    [| class' "main"
    ; style "visibility" cssVisibility
    |]
    [| arraynode "" "input" "" ""
        [| class' "toggle-all"
        ; type' "checkbox"
        ; name "toggle"
        ; checked allCompleted
        ; onClick ~key:(string_of_bool allCompleted) (CheckAll (not allCompleted))
        |]
        [||]
    ; arraynode "" "label" "" ""
        [| for' "toggle-all" |]
        [| text "Mark all as complete" |]
     ; arraynode "" "ul" "" "" [| class' "todo-list" |] (Array.map (fun todo -> if isVisible todo then array_viewEntry todo else noNode) entries)
    |]

let array_viewInput task =
  let open Vdom in
  arraynode "" "header" "" ""
    [| class' "header" |]
    [| arraynode "" "h1" "" "" [||] [| text "todos" |]
    ; arraynode "" "input" "" ""
        [| class' "new-todo"
        ; placeholder "What needs to be done?"
        ; autofocus true
        ; value task
        ; name "newTodo"
        ; onInput (fun str -> (UpdateField str))
        ; onEnter Add
        |]
        [||]
    |]

let array_viewControlsCount entriesLeft =
  let open Vdom in
  let item_ =
    if entriesLeft == 1 then " item" else " items" in
  arraynode "" "span" "" ""
    [| class' "todo-count" |]
    [| arraynode "" "strong" "" "" [||] [| text (string_of_int entriesLeft) |]
    ; text (item_ ^ " left")
    |]

let array_visibilitySwap uri visibility actualVisibility =
  let open Vdom in
  arraynode "" "li" "" ""
    [| onClick ~key:visibility (ChangeVisibility visibility) |]
    [| arraynode "" "a" "" "" [| href uri; classList [("selected", visibility = actualVisibility)] |]
         [| text visibility |]
    |]

let array_viewControlsFilters visibility =
  let open Vdom in
  arraynode "" "ul" "" ""
    [| class' "filters" |]
    [| visibilitySwap "#/" "All" visibility
    ; text " "
    ; visibilitySwap "#/active" "Active" visibility
    ; text " "
    ; visibilitySwap "#/completed" "Completed" visibility
    |]

let array_viewControlsClear entriesCompleted =
  let open Vdom in
  arraynode "" "button" "" ""
    [| class' "clear-completed"
    ; hidden (entriesCompleted == 0)
    ; onClick DeleteComplete
    |]
    [| text ("Clear completed (" ^ string_of_int entriesCompleted ^ ")")
    |]

let array_viewControls visibility entries =
  let open Vdom in
  let entriesCompleted =
    Array.fold_left (fun c {completed} -> if completed then c + 1 else c) 0 entries in
  let entriesLeft =
    Array.length entries - entriesCompleted in
  arraynode "" "footer" "" ""
    [| class' "footer"
    ; hidden (Array.length entries = 0)
    |]
    [| array_viewControlsCount entriesLeft
    ; array_viewControlsFilters visibility
    ; array_viewControlsClear entriesCompleted
    |]

let array_infoFooter =
  let open Vdom in
  arraynode "" "footer" "" "" [| class' "info" |]
    [| arraynode "" "p" "" "" [||] [| text "Double-click to edit a todo" |]
     ; arraynode "" "p" "" "" [||]
         [| text "Written by "
          ; arraynode "" "a" "" "" [| href "https://github.com/evancz" |] [| text "Evan Czaplicki" |]
        ; text " and converted by "
        ; arraynode "" "a" "" "" [| href "https://github.com/overminddl1" |] [| text "OvermindDL1" |]
         |]
     ; arraynode "" "p" "" "" [||]
         [| text "Part of "
          ; arraynode "" "a" "" "" [| href "http://todomvc.com" |] [| text "TodoMVC" |]
         |]
    |]
let view_array model =
  let open Vdom in
  arraynode "" "div" "" ""
    [| class' "todomvc-wrapper"
    ;  style "visibility" "hidden"
    |]
    [| arraynode "" "section" "" ""
        [| class' "todoapp" |]
        [| array_viewInput model.field
        ; array_viewEntries model.visibility model.entries
        ; array_viewControls model.visibility model.entries
        |]
    ; array_infoFooter
    |] *)

(* let s = ref noNode *)
let viewNew model =
  (* let () = s := view_array model in *)
  view model

(* Main Entrance *)

let main =
  standardProgram
    { init
    ; update
    ; view (* = viewNew *)
    ; subscriptions = (fun _model -> Sub.none)
    }

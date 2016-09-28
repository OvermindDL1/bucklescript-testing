
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
  { entries : entry list
  ; field : string
  ; uid : int
  ; visibility : string
  }


let emptyModel =
  { entries = []
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
          (newEntry model.field model.uid) :: model.entries
    }, Cmd.none

  | UpdateField field -> { model with field }, Cmd.none

  | EditingEntry (id, editing) ->
    let updateEntry t =
      if t.id = id then { t with editing } else t
    in { model with
         entries = List.map updateEntry model.entries
       }, Cmd.none

  | UpdateEntry (id, description) ->
    let updateEntry t =
      if t.id = id then { t with description } else t
    in { model with
         entries = List.map updateEntry model.entries
       }, Cmd.none

  | Delete id ->
    { model with
      entries = List.filter (fun t -> t.id <> id) model.entries
    }, Cmd.none

  | DeleteComplete ->
    { model with
      entries = List.filter (fun {completed} -> not completed) model.entries
    }, Cmd.none

  | Check (id, completed) ->
    let updateEntry t =
      if t.id = id then { t with completed } else t
    in { model with
         entries = List.map updateEntry model.entries
       }, Cmd.none

  | CheckAll completed ->
    let updateEntry t =
      { t with completed }
    in { model with
         entries = List.map updateEntry model.entries
       }, Cmd.none
  | ChangeVisibility visibility ->
    { model with visibility }, Cmd.none



(* View rendering *)

let onEnter msg =
  let tagger ev = match ev##keyCode with
    | 13 -> Some msg
    | _ -> None
  in
  on "keydown" tagger


let viewEntry todo =
  li
    [ classList
        [ ("completed", todo.completed)
        ; ("editing", todo.editing)
        ]
    ]
    [ div
        [ class' "view" ]
        [ input
            [ class' "toggle"
            ; type' "checkbox"
            ; checked todo.completed
            ; onClick (Check (todo.id, not todo.completed))
            ]
            []
        ; label
            [ onDoubleClick (EditingEntry (todo.id, true)) ]
            [ text todo.description ]
        ; button
            [ class' "destroy"
            ; onClick (Delete todo.id)
            ]
            []
        ]
    ; input
        [ class' "edit"
        ; value todo.description
        ; name "title"
        ; id ("todo-" ^ string_of_int todo.id)
        ; onInput (fun value -> UpdateEntry (todo.id, value))
        ; onBlur (EditingEntry (todo.id, false))
        ; onEnter (EditingEntry (todo.id, false))
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
    List.for_all (fun {completed} -> completed) entries in
  let cssVisibility =
    if [] = entries then "hidden" else "visible" in
  section
    [ class' "main"
    ; style "visibility" cssVisibility
    ]
    [ input
        [ class' "toggle-all"
        ; type' "checkbox"
        ; name "toggle"
        ; checked allCompleted
        ; onClick (CheckAll (not allCompleted))
        ]
        []
    ; label
        [ for' "toggle-all" ]
        [ text "Mark all as complete" ]
    ; ul [ class' "todo-list" ] (List.map viewEntry (List.filter isVisible entries))
]


let viewInput task =
  header
    [ class' "header" ]
    [ h1 [] [ text "todos" ]
    ; input
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
    [ onClick (ChangeVisibility visibility) ]
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
    List.length (List.filter (fun {completed} -> completed) entries) in
  let entriesLeft =
    List.length entries - entriesCompleted in
  footer
    [ class' "footer"
    ; hidden (List.length entries = 0)
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
        ; text " and "
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

(* let view_button title ?key msg =
  node "button"
    [ match key with
      | None -> on "click" (fun ev -> let () = Js.log ("Event", ev, msg) in msg)
      | Some k -> onKey "click" k (fun ev -> let () = Js.log ("EventKeyed", ev, msg) in msg)
    ]
    [ text title
    ]

let view model =
  let () = Js.log "View called" in
  node "div"
    []
    [ node "span"
        [ style "text-weight" "bold" ]
        [ text (string_of_int model) ]
    ; node "br" [] []
    ; view_button "Increment" Increment
    ; node "br" [] []
    (* ; view_button "Decrement" ~key:(if model = 1 then "1" else "") (if model = 1 then Increment else Decrement) *)
    ; view_button "Decrement" Decrement
    ; node "br" [] []
    ; view_button "Set to 42" (Set 42)
    ; node "br" [] []
    ; if model <> 0 then view_button "Reset" Reset else noNode
    ] *)


(* Main Entrance *)

let main =
  program
    { init
    ; update
    ; view
    }


(* https://github.com/evancz/react-angular-ember-elm-performance-comparison/blob/master/implementations/elm-0.17/Todo.elm *)
open Tea
open App
open Html

(* module IntMap = Map.Make(struct type t = int let compare = compare end) *)
module IntMap = Map.Make(struct type t = int let compare : int -> int -> int = compare end)



(* MODEL *)

type entry =
  { description : string
  ; completed : bool
  ; editing : bool
  ; id : int
  }

(* The full application state of our todo app. *)
type model =
  { entries : entry IntMap.t (* Optimization:  Use a better data structure that actually exists in OCaml *)
  ; field : string
  ; uid : int
  ; visibility : string
  }


let emptyModel =
  { entries = IntMap.empty
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
  (* | NoOp *)
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
  (*  NoOp -> model, Cmd.none *)

  | Add ->
    { model with
      uid = model.uid + 1;
      field = "";
      entries =
        if model.field = "" then
          model.entries
        else
          IntMap.add model.uid (newEntry model.field model.uid) model.entries
    }, Cmd.none

  | UpdateField field -> { model with field }, Cmd.none

  | EditingEntry (id, editing) ->
    let updateEntry t =
      if t.id = id then { t with editing } else t
    in { model with
         entries = if IntMap.mem id model.entries then IntMap.add id (updateEntry (IntMap.find id model.entries)) model.entries else model.entries
         (* entries = Array.map updateEntry model.entries *)
       }, if editing then Cmds.focus ("todo-" ^ string_of_int id) else Cmd.none

  | UpdateEntry (id, description) ->
    let updateEntry t =
      if t.id = id then { t with description } else t
    in { model with
         entries = if IntMap.mem id model.entries then IntMap.add id (updateEntry (IntMap.find id model.entries)) model.entries else model.entries
       }, Cmd.none

  | Delete id ->
    { model with
      entries = IntMap.remove id model.entries
    }, Cmd.none

  | DeleteComplete ->
    { model with
      entries = IntMap.filter (fun id {completed} -> not completed) model.entries
    }, Cmd.none

  | Check (id, completed) ->
    let updateEntry t =
      if t.id = id then { t with completed } else t
    in { model with
         entries = if IntMap.mem id model.entries then IntMap.add id (updateEntry (IntMap.find id model.entries)) model.entries else model.entries
       }, Cmd.none

  | CheckAll completed ->
    let updateEntry t =
      { t with completed }
    in { model with
         entries = IntMap.map updateEntry model.entries
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


let viewEntry todo () =
  let key = string_of_int todo.id in
  let fullkey = (key ^ string_of_bool todo.completed ^ string_of_bool todo.editing) in
  (* Optimized:  Added a key to the node to early-out if exact match, if key is unspecified then the sub section is
     always recursed into, thus this is *not* like elm's keyed nodes but rather more strict. *)
  li ~key:fullkey
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
            ; onClick ~key:fullkey (Check (todo.id, not todo.completed))
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
    ; input
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
    IntMap.for_all (fun id {completed} -> completed) entries in
  let cssVisibility =
    if IntMap.is_empty entries then "hidden" else "visible" in
  section
    [ class' "main"
    ; style "visibility" cssVisibility
    ]
    [ input
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
    ; ul
        [ class' "todo-list" ]
        (IntMap.bindings entries |> List.map (fun (id, todo) -> if isVisible todo then lazy1 (string_of_int todo.id ^ string_of_bool todo.completed ^ string_of_bool todo.editing) (viewEntry todo) else noNode))
]


let viewInput task () =
  header ~key:task
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
  let item_ = if entriesLeft == 1 then " item" else " items" in
  let left = string_of_int entriesLeft in
  span ~key:left
    [ class' "todo-count" ]
    [ strong [] [ text left ]
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
    IntMap.fold (fun id {completed} c -> if completed then c + 1 else c) entries 0 in
  let len = IntMap.cardinal entries in
  let entriesLeft =
    len - entriesCompleted in
  footer
    [ class' "footer"
    ; hidden (len = 0)
    ]
    [ viewControlsCount entriesLeft
    ; viewControlsFilters visibility
    ; viewControlsClear entriesCompleted
    ]


let infoFooter () =
  footer ~key:"1"
    [ class' "info" ]
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
      (* [ viewInput model.field () *)
      (* Optimization: Set the input as a lazy field *)
      [ lazy1 model.field (viewInput model.field)
      ; viewEntries model.visibility model.entries
      ; viewControls model.visibility model.entries
      ]
    ; lazy1 "" infoFooter
    ]


(* Main Entrance *)

let main =
  standardProgram
    { init
    ; update
    ; view
    ; subscriptions = (fun model -> Sub.none)
    }

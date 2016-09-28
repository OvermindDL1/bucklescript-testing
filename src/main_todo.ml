
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

let viewInput task =
  header
    [ className "header" ]
    [ h1 [] [ text "todos" ]
    ; input
        [ className "new-todo"
        ; placeholder "What needs to be done?"
        ; autofocus True
        ; value task
        ; name "newTodo"
        ; onInput UpdateField
        ; onEnter Add
        ]
        []
    ]

let view model =
  div
    [ className "todomvc-wrapper"
    ; style "visibility" "hidden"
    ]
    [ section
      [ className "todoapp" ]
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

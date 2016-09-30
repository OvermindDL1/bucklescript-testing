
open Tea.App
open Tea.Html


type msg =
  | Increment of int
  | Decrement of int
  | Reset of int
  | Set of int * int


module IntMap = Map.Make(struct type t = int let compare = compare end)


type 'parentMsg model =
  { values : int IntMap.t
  ; defaultValue : int
  ; lift : msg -> 'parentMsg
  }


let init defaultValue lift =
  { values = IntMap.empty
  ; defaultValue
  ; lift
  }


let get_value id model =
  if IntMap.mem id model.values then
    IntMap.find id model.values
  else
    model.defaultValue


let put_value id value model =
  { model with
    values = IntMap.add id value model.values
  }

let mutate_value id op model =
  let value = get_value id model in
  put_value id (op value) model


let update model = function
  | Increment id -> mutate_value id ((+)1) model
  | Decrement id -> mutate_value id (fun i->i-1) model
  | Reset id -> put_value id 0 model
  | Set (id, v) -> put_value id v model


let view_button title ?(key="") msg =
  button
    [ onClick ~key:key msg
    ]
    [ text title
    ]

let view id model =
  let lift = model.lift in
  let value = get_value id model in
  div
    [ styles [("display","inline-block"); ("vertical-align","top")] ]
    [ span
        [ style "text-weight" "bold" ]
        [ text (string_of_int value) ]
    ; br []
    ; view_button "Increment" (lift (Increment id))
    ; br []
    ; view_button "Decrement" (lift (Decrement id))
    ; br []
    ; view_button "Set to 42" (lift (Set (id, 42)))
    ; br []
    ; if value <> 0 then view_button "Reset" (lift (Reset id)) else noNode
    ]

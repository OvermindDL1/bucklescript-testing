
open Tea.App
open Tea.Html


type msg =
| Counter of int * Counter.msg
| AddCounter
| RemoveCounter


type model =
  { counters : Counter.model list
  }


let update model = function
  | Counter (idx, ms) -> let () = Js.log (model, idx, ms) in
    { (*model with*)
      counters = model.counters |> List.mapi (fun i m -> if i <> idx then m else Counter.update m ms);
    }
  | AddCounter ->
    { (*model with*)
      counters = Counter.init () :: model.counters;
    }
  | RemoveCounter ->
    { (*model with*)
      counters = List.tl model.counters;
    }


let view_button title ?(key="") msg =
  button
    [ onClick ~key:key msg
    ]
    [ text title
    ]

let view model =
  div
    []
    [ button
        [ onClick AddCounter ]
        [ text "Prepend a Counter" ]
    ; if List.length model.counters = 0 then noNode else
        button
          [ onClick RemoveCounter ]
          [ text "Delete a Counter" ]
    ; div
        []
        (List.mapi (fun i mo -> Counter.view (fun ms -> Counter (i, ms)) mo) model.counters)
    ]


let main =
  beginnerProgram {
    model={ counters=[] };
    update;
    view;
  }

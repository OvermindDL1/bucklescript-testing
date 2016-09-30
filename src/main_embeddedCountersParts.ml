
open Tea.App
open Tea.Html


type msg =
| Counters of CounterParts.msg
| AddCounter
| RemoveCounter


type model =
  { counters : msg CounterParts.model
  ; count : int
  }


let update model = function
  | Counters cMsg -> let () = Js.log (model, cMsg) in
    { model with
      counters = CounterParts.update model.counters cMsg
    }
  | AddCounter ->
    { model with
      count = model.count + 1;
    }
  | RemoveCounter ->
    { model with
      count = model.count - 1;
    }


let view_button title ?(key="") msg =
  button
    [ onClick ~key:key msg
    ]
    [ text title
    ]

let view model =
  let showCounter () =
    let rec showCountere_rec l a b =
      if a > b then l
      else showCountere_rec (CounterParts.view b model.counters :: l) a (b - 1)
    in showCountere_rec [] 1 model.count in
  div
    []
    [ button
        [ onClick AddCounter ]
        [ text "Prepend a Counter" ]
    ; if model.count = 0 then noNode else
        button
          [ onClick RemoveCounter ]
          [ text "Delete a Counter" ]
    ; div
        []
        (showCounter ())
    ]


let main =
  beginnerProgram {
    model={ counters = CounterParts.init 4 (fun sm -> Counters sm); count = 0 };
    update;
    view;
  }

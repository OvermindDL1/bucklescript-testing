open Tea

(* This is a direct conversion from other code, not made to be pretty or to demonstrate how things should be done *)
(* I.E.  Ignore this. *)

type model =
  { data : int array array
  ; maxValue : int
  ; value : int
  }


type msg =
  | UpdateValue of string
  | DoUpdate of Time.t


let init () =
  { data = Array.make_matrix 31 31 0
  ; maxValue = 1
  ; value = 0
  }, Cmd.none


let update model = function
  | UpdateValue sValue ->
    let value =
      try int_of_string sValue
      with _ -> model.value in
    { model with value }, Cmd.none
  | DoUpdate _ ->
    let data : int array array =
      let data = model.data in
      let fullX = Array.length data in
      let fullY = Array.length data.(0) in
      let halfX = fullX / 2 in
      let halfY = fullY / 2 in
      let () = data.(halfX).(halfY) <- model.value in
      let () =
        let () = Array.fill data.(0) 0 fullY 0 in
        let () = Array.fill data.(fullX-2) 0 fullY 0 in
        for x = 1 to (Array.length data - 2) do
          let () = data.(x).(0) <- 0 in
          let () = data.(x).(fullY-2) <- 0 in
          for y = 1 to (Array.length data.(0) - 2) do
            let () = data.(x).(y) <- data.(x).(y) - 3000 in
            let () = if data.(x).(y) < 0 then data.(x).(y) <- 0 else () in
            let processSide xx yy =
              if (data.(xx).(yy) * 12) < (data.(x).(y) * 10) then
                let diff = data.(x).(y) - data.(xx).(yy) in
                let diff = diff / 20 in
                let () = data.(xx).(yy) <- data.(xx).(yy) + diff in
                let () = data.(x).(y) <- data.(x).(y) - diff in
                ()
              else () in
            let () = processSide (x-1) y in
            let () = processSide (x+1) y in
            let () = processSide x (y-1) in
            let () = processSide x (y+1) in
            ()
          done
        done in
      data in
    let maxValue =
      let inner value arr =
        Array.fold_left (fun maxValue value -> if maxValue > value then maxValue else value) value arr in
      Array.fold_left inner 1 data in
    { model with data; maxValue }, Cmd.none

let subscriptions _model =
  Time.every (Time.inMilliseconds 50.0) (fun t -> DoUpdate t)

let view model =
  let open Svg in
  let open Svg.Attributes in
  let mapperY coordX coordY value =
    let colorHex =
      let red =
        if value > 2000000 then "FF" else
        if value > 1000000 then "40" else "00" in
      let green =
        if value > 750000 then "FF" else
        if value > 550000 then "80" else "00" in
      let blue =
        let bVal = (value * 255) / model.maxValue in
        if bVal > 255 then "FF"
        else if bVal < 0 then "00"
        else Printf.sprintf "%02X" bVal in
      "#" ^ red ^ green ^ blue in
    let strokeHex =
      if value > 0
      then "#FFFFFF"
      else "#000000" in
    rect
      [ x (string_of_int (coordX * 10))
      ; y (string_of_int (coordY * 10))
      ; width "10"
      ; height "10"
      ; fill colorHex
      ; stroke strokeHex
      ] [] in
  let mapperX coordX value =
    let values = Array.mapi (mapperY coordX) value in
    Array.to_list values in
  let valueArray = Array.mapi mapperX model.data in
  Html.div []
    [ Html.input' [ Html.placeholder "Integer value"; Html.onInput (fun s -> UpdateValue s) ] []
    ; Html.br []
    ; svg [ viewBox "0 0 300 300"; width "300px" ]
        ( Array.to_list valueArray |> List.concat )
    ]


let main =
  let open App in
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

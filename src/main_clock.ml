
open Tea
open App
open Html

type model = float


type msg =
  | TestMsg
  | Time of float


let init () = (Web.Date.now (), Cmd.none)


let update model =
  (* let () = Js.log ("Update", model) in *)
  function
  | TestMsg -> model, Cmd.none
  | Time time -> time, Cmd.none


let subscriptions model =
  (* let () = Js.log ("Subscriptions", model) in *)
  Time.every 16 (fun t -> Time t)


let view model =
  let ms = int_of_float (mod_float model 1000.0) in
  let sec' = int_of_float (model /. 1000.0) in
  let sec = sec' mod 60 in
  let min' = sec' / 60 in
  let min = min' mod 60 in
  let hrs' = min' / 60 in
  let hrs = hrs' mod 24 in
  span
    []
    [ text
        ( string_of_int hrs ^ ":" ^
          string_of_int min ^ ":" ^
          string_of_int sec ^ "." ^
          string_of_int ms
        )
    ]


let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

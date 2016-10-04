
open Tea
open App
open Html

type model = float


type msg =
  | Time of float


let init () = (Web.Date.now (), Cmd.none)


let update model = let () = Js.log ("Update", model) in function
  | Time time -> time, Cmd.none


let subscriptions model =
  let () = Js.log ("Subscriptions", model) in
  Time.every 500 (fun t -> Time t)


let view model =
  text (string_of_float model)


let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

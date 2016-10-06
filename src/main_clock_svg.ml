
open Tea
open App

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


let tau = 8.0 *. atan 1.0

let view model =
  let open Svg in
  let open Svg.Attributes in
  let angle = tau *. (Time.inMinutes model) in
  let handX = string_of_float (50.0 +. 40.0 *. cos angle) in
  let handY = string_of_float (50.0 +. 40.0 *. sin angle) in
  svg [ viewBox "0 0 100 100"; width "300px" ]
    [ circle [ cx "50"; cy "50"; r "45"; fill "#0B79CE" ] []
    ; line [ x1 "50"; y1 "50"; x2 handX; y2 handY; stroke "#023963" ] []
    ]


let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

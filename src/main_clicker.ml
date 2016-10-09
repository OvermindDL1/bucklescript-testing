
open Tea
open App
open Html


type mathMod =
  { baseAdd : float
  ; mult : float
  }


type upgradeHow =
  | ClickMath of mathMod
  | AddAutoClicker of mathMod

type upgradeDef =
  { cost : float
  ; name : string
  ; math : upgradeHow
  }

type model =
  { startTime : Time.t
  ; curTime : Time.t
  ; lastUpdated : Time.t
  ; credits : float
  ; clickWorthMath : mathMod
  ; upgradesRemaining : upgradeDef list
  ; upgradesUsed : int
  ; messages : string list
  ; autoClicker : mathMod
  }


type msg =
  | OnFrame of AnimationFrame.t
  | Click
  | DoUpgrade of string

(* Type helpers *)

let mathMod baseAdd mult =
  { baseAdd; mult }


(* Init functionality*)

let init_mathMod =
  mathMod 1.0 1.0

let empty_mathMod =
  mathMod 0.0 1.0

let init_upgrade cost name math =
  { cost; name; math }

let init_upgrades =
  List.sort (fun upgradeL upgradeR -> int_of_float (upgradeL.cost -. upgradeR.cost))
    (* Keep the names unique as those are the key *)
    [ init_upgrade 10.0 "1 more credit per click" (ClickMath (mathMod 1.0 1.0))
    ; init_upgrade 50.0 "Half a credit more per click" (ClickMath (mathMod 0.5 1.0))
    ; init_upgrade 100.0 "50% more credits per click" (ClickMath (mathMod 0.0 1.5))
    ; init_upgrade 150.0 "Finally!  An auto-clicker!" (AddAutoClicker (mathMod 1.0 1.0))
    ; init_upgrade 200.0 "Upgrade the auto-clicker!" (AddAutoClicker (mathMod 0.0 1.5))
    ; init_upgrade 250.0 "Even 50% more credits per click" (ClickMath (mathMod 0.0 1.5))
    ; init_upgrade 300.0 "Get another base half-credit per click please?" (ClickMath (mathMod 0.5 1.0))
    ; init_upgrade 350.0 "Ooo, double the click value!" (ClickMath (mathMod 0.0 2.0))
    ; init_upgrade 400.0 "Get another auto-clicker?" (AddAutoClicker (mathMod 1.0 1.0))
    ; init_upgrade 500.0 "Get yet another auto-clicker!" (AddAutoClicker (mathMod 1.0 1.0))
    ; init_upgrade 750.0 "Upgrade the auto-clickers?" (AddAutoClicker (mathMod 0.0 1.5))
    ; init_upgrade 1000.0 "Get another base half-credit per click" (ClickMath (mathMod 0.5 1.0))
    ; init_upgrade 1250.0 "Found a way to double output of clicks!" (ClickMath (mathMod 0.0 2.0))
    ; init_upgrade 1500.0 "Upgrade the auto-clickers much more!" (AddAutoClicker (mathMod 0.0 4.0))
    ; init_upgrade 2000.0 "Both an additional half credit and another 50% more!" (ClickMath (mathMod 0.5 1.5))
    ; init_upgrade 5000.0 "Even more 50% more credits per click" (ClickMath (mathMod 0.0 1.5))
    ; init_upgrade 10000.0 "*2* base credits per click! Wow!" (ClickMath (mathMod 2.0 1.0))
    ; init_upgrade 20000.0 "Last upgrade! 10x everything!  Please submit PR's with more upgrades and adjust this one to be the last.  ^.^" (ClickMath (mathMod 0.0 10.0))
    ]


let init () =
  { startTime = 0.0
  ; curTime = 0.0
  ; lastUpdated = 0.0
  ; credits = 0.0
  ; clickWorthMath = init_mathMod
  ; upgradesRemaining = init_upgrades
  ; upgradesUsed = 0
  ; messages = []
  ; autoClicker = empty_mathMod
  }, Cmd.none


(* Math helpers *)
let calc_mathMod_immediate initial math =
  (initial +. math.baseAdd) *. math.mult

let calc_mathMod_combine math1 math2 =
  { baseAdd = math1.baseAdd +. math2.baseAdd
  ; mult = math1.mult *. math2.mult
  }

let worthString worth =
  string_of_float worth

(* Base definitions *)

let baseWorth_click = 0.000

(* Updating functionality *)

let calcWorth_click math =
  calc_mathMod_immediate baseWorth_click math

let applyUpgrade name model =
  let rec aux model untouched = function
    | [] -> { model with upgradesRemaining = List.rev untouched }
    | upgrade :: rest when upgrade.name <> name -> aux model (upgrade :: untouched) rest
    | upgrade :: rest when upgrade.cost > model.credits -> model
    | upgrade :: rest ->
      (* let () = Js.log ("Upgrading", upgrade) in *)
      let newModel = match upgrade.math with
        | ClickMath math ->
          { model
            with clickWorthMath = calc_mathMod_combine model.clickWorthMath math
               ; credits = model.credits -. upgrade.cost
               ; upgradesUsed = model.upgradesUsed + 1
               ; messages = ("Bought " ^ upgrade.name ^ " for " ^ worthString upgrade.cost ^ " credits") :: model.messages
          }
        | AddAutoClicker math ->
          { model
            with autoClicker = calc_mathMod_combine model.autoClicker math
               ; credits = model.credits -. upgrade.cost
               ; upgradesUsed = model.upgradesUsed + 1
               ; messages = ("Bought " ^ upgrade.name ^ " for " ^ worthString upgrade.cost ^ " credits") :: model.messages
          }
      in { newModel with
           upgradesRemaining = List.append (List.rev untouched) rest
         }
  in aux model [] model.upgradesRemaining


let update model =
  (* let () = Js.log ("Update", model) in *)
  let open AnimationFrame in
  function
  | OnFrame ev ->
    {model
     with startTime = if model.startTime < 1.0 then ev.time else model.startTime
        ; curTime = ev.time
        ; credits = model.credits +. ((ev.delta *. 0.001) *. calcWorth_click model.clickWorthMath *. model.autoClicker.mult *. model.autoClicker.baseAdd)
    }, Cmd.none
  | Click ->
    { model
      with credits = model.credits +. calcWorth_click model.clickWorthMath
    }, Cmd.none
  | DoUpgrade name ->
    (* let () = Js.log ("DoUpgrade", name, model, applyUpgrade name model) in *)
    applyUpgrade name model, Cmd.none


let subscriptions model =
  (* let () = Js.log ("Subscriptions", model) in *)
  if model.autoClicker.baseAdd > 0.0 || model.startTime < 1.0 then
    AnimationFrame.every (fun ev -> OnFrame ev)
  else
    Sub.none


(* View handling *)

let worthStringText worth =
  text (worthString worth)


let css_topContainer =
  styles
    [ "background-color", "rgb(0,0,0)"
    ; "color", "rgb(255,255,255)"
    ; "vertical-align", "top"
    ; "height", "100%"
    ; "width", "100%"
    ]


let styles_container =
    [ "background-color", "rgb(32,16,16)"
    ; "color", "rgb(212,212,192)"
    ; "vertical-align", "top"
    (* ; "height", "100%" *)
    (* ; "padding", "4px" *)
    ]

let css_container_top =
  styles
    ( ("width", "100%")
      :: styles_container
    )

let css_container_bot =
  styles
    ( ("width", "100%")
      :: styles_container
    )

let css_container_center =
  styles
    ( ("width", "100%")
      :: styles_container
    )

let view_topBar model =
  tr
    [ css_container_top
    ]
    [ td
        []
        [ worthStringText model.credits
        ]
    ]

let view_botBar model =
  tr
    [ css_container_bot
    ]
    [ td
        []
        (List.map (fun message -> div ~key:message [] [ text message ]) model.messages)
    ]


let rec view_upgrades model = function
  | upgrade :: rest when model.credits >= upgrade.cost ->
    button ~key:upgrade.name
      [ onClick (DoUpgrade upgrade.name) ]
      [ text upgrade.name ]
    :: view_upgrades model rest
  | _ -> []

let view_center model =
  tr
    [ css_container_center
    ]
    [ td
        []
        ( button [ onClick Click ] [ text "Click" ]
          :: view_upgrades model model.upgradesRemaining
        )
    ]


let view model =
  table
    [ css_topContainer
    ]
    [ tbody
        []
        [ view_topBar model
        ; view_center model
        ; view_botBar model
        ]
    ]

let main =
  standardProgram {
    init;
    update;
    view;
    subscriptions;
  }

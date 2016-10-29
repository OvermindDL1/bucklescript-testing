
open Tea


module IntMap = Map.Make(struct type t = int let compare = compare end)

module IntPairMap = Map.Make(struct type t = int*int let compare = compare end)


let maxInfluence = 255


type objectTypes =
  (* Base (team, influenceAmt) *)
  | Base of int * int

type model = {
  map : int array array;
  influence : int array array;
  units : objectTypes list IntPairMap.t;
  pTeamResources : int;
  nTeamResources : int;
}


type msg =
  | OnUrlChange of int array array
  | AITick
  | InfluenceTick


let toUrl _model =
  ""

let fromUrl url =
  let open Result in
  let mapDecoder =
    let open Json.Decoder in
    array (array int) in
  match Json.Decoder.decodeString mapDecoder url with
  | Ok map -> map
  | Error _ -> Array.make_matrix 32 32 0


let init () location =
  let open Web.Location in
  let map = fromUrl location.hash in
  let width = Array.length map in
  let height = Array.length map.(0) in
  let units =
    IntPairMap.empty
    |> IntPairMap.add (4, height-4)
      [ Base (1, 12) ]
    |> IntPairMap.add (width-4, 4)
      [ Base (-1, 12) ]
    in
  let model = {
    map;
    influence = Array.make_matrix width height 0;
    units;
    pTeamResources = 1000;
    nTeamResources = 1000;
  } in
  model, Cmd.none


let addUnit coords unit dict =
  let list =
    if IntPairMap.mem coords dict then
      IntPairMap.find coords dict else
      [] in
  IntPairMap.add coords (unit :: list) dict


let rec mergeUnits dict = function
  | [] -> dict
  | (coords, unit) :: rest -> addUnit coords unit (mergeUnits dict rest)


let update model = function
  | OnUrlChange _map ->
    model, Cmd.none
  | AITick ->
    let width = Array.length model.map in
    let height = Array.length model.map.(0) in
    let influence = model.influence in
    let units = model.units in
    let tickUnit (x, y) ret = function
      | Base (team, inf) -> (* Add in test to use up resources when building and to destroy self if not enough influence here *)
        let newBase = Base (team, inf) in
        if x > 1 && y > 1 && influence.(x-1).(y-1) * team > 2 && false = (IntPairMap.mem (x-1, y-1) units) then ((x-1, y-1), newBase) :: ret else
        if x > 1 && y < (height-2) && influence.(x-1).(y+1) * team > 2 && false = (IntPairMap.mem (x-1, y+1) units) then ((x-1, y+1), newBase) :: ret else
        if x < (width-2) && y > 1 && influence.(x+1).(y-1) * team > 2 && false = (IntPairMap.mem (x+1, y-1) units) then ((x+1, y-1), newBase) :: ret else
        if x < (width-2)  && y < (height-2) && influence.(x+1).(y+1) * team > 2 && false = (IntPairMap.mem (x+1, y+1) units) then ((x+1, y+1), newBase) :: ret else
          ret in
    let tickUnits coords units ret =
      List.fold_left (tickUnit coords) ret units in
    let newUnits = IntPairMap.fold tickUnits units [] in
    let units = mergeUnits units newUnits in
    {model with
     units;
    }, Cmd.none
  | InfluenceTick ->
    let width = Array.length model.map in
    let height = Array.length model.map.(0) in
    let influence = Array.copy model.influence in
    let rec addInfluence (x, y) = function
      | [] -> ()
      | Base (team, amt) :: rest ->
        let () = influence.(x).(y) <- model.influence.(x).(y) + (amt * team) in
        addInfluence (x, y) rest
      (* | _ :: rest -> addInfluence (x, y) rest *) in
    let () = IntPairMap.iter addInfluence model.units in
    let processInfY x y t = (* Process this out to changes to read *)
      if x = 0 || x = (width-1) || y = 0 || y = (height-1) then influence.(x).(y) <- 0 else
      if t = 0 then
        let inf = model.influence.(x).(y) in
        let infXN = model.influence.(x-1).(y) in
        let infXP = model.influence.(x+1).(y) in
        let infYN = model.influence.(x).(y-1) in
        let infYP = model.influence.(x).(y+1) in
        let part = inf / 6 in
        (* let comp = inf - part in *)
        let () = (*if infXN < comp then*) influence.(x-1).(y) <- infXN+part in
        let () = (*if infXP < comp then*) influence.(x+1).(y) <- infXP+part in
        let () = (*if infYN < comp then*) influence.(x).(y-1) <- infYN+part in
        let () = (*if infYP < comp then*) influence.(x).(y+1) <- infYP+part in
        influence.(x).(y) <- inf - (part * 4)
      else () in
    let processX x yArr =
      Array.iteri (processInfY x) yArr in
    let reduceInfY x y i =
      if i < -255 then
        influence.(x).(y) <- -255
      else if i < 0 then
        influence.(x).(y) <- i + 1
      else if i > 255 then
        influence.(x).(y) <- 255
      else if i > 0 then
        influence.(x).(y) <- i - 1
      else () in
    let reduceInfX x yArr =
      Array.iteri (reduceInfY x) yArr in
    let () = Array.iteri processX model.map in
    let () = Array.iteri reduceInfX influence in
    let (scoreN, scoreP) =
      let scoreY (sn, sp) inf =
        if inf < -7 then (sn-inf+7, sp)
        else if inf > 7 then (sn, sp+inf-7)
        else (sn, sp) in
      let scoreX scores yArr =
        Array.fold_left scoreY scores yArr in
      Array.fold_left scoreX (0, 0) influence in
    let nTeamResources = model.nTeamResources + scoreN in
    let pTeamResources = model.pTeamResources + scoreP in
    { model with
      influence;
      nTeamResources;
      pTeamResources;
    }, Cmd.none


let subscriptions _model =
  Sub.batch
    [ Time.every (Time.inMilliseconds 500.0) (fun _ -> InfluenceTick)
    ; Time.every (Time.inMilliseconds 1100.0)  (fun _ -> AITick)
    ]


let cellSize = 12 (* Always be an even integral *)
let cellSizeStr = string_of_int cellSize
let cellSizeHalf = cellSize / 2
let cellSizeHalfStr = string_of_int cellSizeHalf

let view model =
  let open Svg in
  let open Svg.Attributes in
  let mapWidth = Array.length model.map in
  let mapHeight = Array.length model.map.(0) in
  let unitsSvg () =
    let rec unitToSvg (coords, units) = match units with
      | [] -> []
      | Base (team, _influence) :: rest ->
        circle
          [ r cellSizeHalfStr
          ; fill (if team < 0 then "#FF0000" else if team > 0 then "#0000FF" else "#111111")
          ; stroke "#000000"
          ; cx (string_of_int (fst coords * cellSize + cellSizeHalf))
          ; cy (string_of_int (snd coords * cellSize + cellSizeHalf))
          ] [] :: unitToSvg (coords, rest) in
    IntPairMap.bindings model.units
    |> List.map unitToSvg
    |> List.flatten in
  let tileToSvg cx cy value =
    let key = string_of_int value in
    if cx = 0 || cx = (mapWidth-1) || cy = 0 || cy = (mapHeight-1) then
      noNode else
    if value = 0 then (* Open *)
      let v = model.influence.(cx).(cy) in
      let fillColor =
        let av = abs(v) in
        let density = if av >= maxInfluence then "0" else (string_of_int (255-av)) in
        let color =
          if v < 0 then
            "rgb(255," ^ density ^ "," ^ density ^ ")"
          else if v > 0 then
            "rgb(" ^ density ^ "," ^ density ^ ",255)"
          else "rgb(255,255,255)" in
        color in
      rect
        [ x (string_of_int (cx * cellSize))
        ; y (string_of_int (cy * cellSize))
        ; width cellSizeStr
        ; height cellSizeStr
        ; fill fillColor
        ; stroke (if v<0 then "#FF0000" else if v>0 then "#0000FF" else "#FFFFFF")
        ] []
    else if value = 1 then (* Wall *)
      rect ~key
        [ x (string_of_int (cx * cellSize))
        ; y (string_of_int (cy * cellSize))
        ; width cellSizeStr
        ; height cellSizeStr
        ; fill "#222222"
        ; stroke "#000000"
        ] []
    else
      rect ~key
        [ x (string_of_int (cx * cellSize))
        ; y (string_of_int (cy * cellSize))
        ; width cellSizeStr
        ; height cellSizeStr
        ; fill "#FF88FF"
        ; stroke "#FF00FF"
        ] []
  in
  let tileMapperX cx value =
    let values = Array.mapi (tileToSvg cx) value in
    Array.to_list values in
  let valueArray = Array.mapi tileMapperX model.map in
  Html.div
    []
    [ svg
        [ viewBox ("0 0 " ^ string_of_int (mapWidth * cellSize) ^ " " ^ string_of_int (mapHeight * cellSize))
        ; width (string_of_int (mapWidth * cellSize) ^ "px")
        ]
        [ g [] ( Array.to_list valueArray |> List.concat )
        ; lazy1 (string_of_int (IntPairMap.cardinal model.units)) (fun () -> g [] (unitsSvg ()))
        ]
    ]


let locationToMessage location =
  let open Web.Location in
  OnUrlChange (fromUrl location.hash)


let main =
  let open Navigation in
  navigationProgram locationToMessage {
    init;
    update;
    view;
    subscriptions;
    shutdown = (fun _model -> Cmd.none);
  }

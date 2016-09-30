
open Tea

type time = float


type 'msg mySub =
  | Every of time * (time -> 'msg)


type 'msg myCmd =
  | Delay of time * (unit -> 'msg)


let every interval tagger =
  Every (interval, tagger)


let delay msTime msg =
  Cmd.call (fun enqueue -> let _unhandledID = Web.Window.setTimeout (fun () -> enqueue msg) msTime in ())

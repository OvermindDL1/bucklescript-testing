
open Tea

type time = float


type 'msg mySub =
  | Every of time * (time -> 'msg)


type 'msg myCmd =
  | Delay of time * (unit -> 'msg)


let every interval tagger =
  Every (interval, tagger)


let delay msTime msg =
  Cmd.call
    ( fun callbacks ->
        let _unhandledID =
          Web.Window.setTimeout
            ( fun () ->
                let open Vdom in
                !callbacks.enqueue msg
            )
            msTime
        in ()
    )

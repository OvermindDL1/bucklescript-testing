
type t = <
  body : Web_node.t;
  createElement : string -> Web_node.t [@bs.meth];
  createElementNS : string -> string -> Web_node.t [@bs.meth];
  createComment : unit -> Web_node.t [@bs.meth];
  createTextNode : string -> Web_node.t [@bs.meth];
  getElementById : string -> Web_node.t Js.null [@bs.meth];
> Js.t

external document : t = "document" [@@bs.val]

let body () = document##body

let createElement typ = document##createElement typ

let createElementNS namespace key = document##createElementNS namespace key

let createComment () = document##createComment ()

let createTextNode text = document##createTextNode text

let getElementById typ = document##getElementById typ

let createElementNsOptional namespace tagName =
  match namespace with
  | None -> document##createElement tagName
  | Some ns -> document##createElementNS ns tagName

let createTextNode text = document##createTextNode text

let createComment () = document##createComment ()

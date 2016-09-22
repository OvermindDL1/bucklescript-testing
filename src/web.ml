

type style
(* = <
  get : string -> string [@bs.get_index];
  set : string -> string -> unit [@bs.set_index];
> Js.t *)

type node = <
  appendChild : node -> node [@bs.meth];
  style : style [@bs.get];
  setAttributeNS : string -> string -> string -> unit [@bs.meth];
  setAttribute : string -> string -> unit [@bs.meth];
  removeAttributeNS : string -> string -> unit [@bs.meth];
  removeAttribute : string -> unit [@bs.meth];
> Js.t


type document = <
  body : node;
  createElement : string -> node [@bs.meth];
  createElementNS : string -> string -> node [@bs.meth];
  createComment : unit -> node [@bs.meth];
  createTextNode : string -> node [@bs.meth];
  getElementById : string -> node Js.null [@bs.meth];
> Js.t

external document : document = "document" [@@bs.val]


(* Helpers *)

let createElementNsOptional namespace tagName =
  match namespace with
  | None -> document##createElement tagName
  | Some ns -> document##createElementNS ns tagName

let createTextNode text =
  document##createTextNode text

let createComment () =
  document##createComment ()


external getStyle : style -> string -> string = "" [@@bs.get_index]

external setStyle : style -> string -> string -> unit = "" [@@bs.set_index]

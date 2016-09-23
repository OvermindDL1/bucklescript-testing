
type style
(* = <
   get : string -> string [@bs.get_index];
   set : string -> string -> unit [@bs.set_index];
   > Js.t *)

external getStyle : style -> string -> string = "" [@@bs.get_index]

external setStyle : style -> string -> string -> unit = "" [@@bs.set_index]

type t = <
  appendChild : t -> t [@bs.meth];
  style : style [@bs.get];
  setAttributeNS : string -> string -> string -> unit [@bs.meth];
  setAttribute : string -> string -> unit [@bs.meth];
  removeAttributeNS : string -> string -> unit [@bs.meth];
  removeAttribute : string -> unit [@bs.meth];
  addEventListener : string -> Web_event.cb -> Web_event.options -> unit [@bs.meth];
  removeEventListener : string -> Web_event.cb -> Web_event.options -> unit [@bs.meth];
> Js.t

let appendChild n child = n##appendChild child

let style n = n##style

let getStyle n key = getStyle n##style key

let setStyle n key value = setStyle n##style key value

let setAttributeNS n namespace key value = n##setAttributeNS namespace key value

let setAttribute n key value = n##setAttribute key value

let removeAttributeNS n namespace key = n##removeAttributeNS namespace key

let removeAttribute n key = n##removeAttribute key

let addEventListener n typ listener options = n##addEventListener typ listener options

let removeEventListener n typ listener options = n##removeEventListener typ listener options

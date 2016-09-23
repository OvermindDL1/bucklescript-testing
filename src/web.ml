



module Node = struct
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
  > Js.t

  let appendChild n child = n##appendChild child

  let style n = n##style

  let getStyle n key = getStyle n##style key

  let setStyle n key value = setStyle n##style key value

  let setAttributeNS n namespace key value = n##setAttributeNS namespace key value

  let setAttribute n key value = n##setAttribute key value

  let removeAttributeNS n namespace key = n##removeAttributeNS namespace key

  let removeAttribute n key = n##removeAttribute key
end





module Document = struct
  type t = <
    body : Node.t;
    createElement : string -> Node.t [@bs.meth];
    createElementNS : string -> string -> Node.t [@bs.meth];
    createComment : unit -> Node.t [@bs.meth];
    createTextNode : string -> Node.t [@bs.meth];
    getElementById : string -> Node.t Js.null [@bs.meth];
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
end

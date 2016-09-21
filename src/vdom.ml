
(* https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md *)

type event

(* Attributes are not properties *)
(* https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes *)

type 'msg property =
  | NoProp
  | RawProp of string * string  (* This last string needs to be made something more generic, maybe a function... *)
  | Attribute of string * string
  | Data of string * string
  | Event of string * (event -> 'msg)
  | Style of (string * string) list

type 'msg properties = 'msg property list

type 'msg vnode =
  | NoVNode
  | Text of string
  (* Node namespace key tagName properties children  *)
  | Node of string option * string option * string * 'msg properties * 'msg vnode list
  (* | NSKeyedNode of string option * string * 'msg property list * (int * 'msg vnode) list *)


(* Nodes *)

let noNode = NoVNode

let text s = Text s

let node tagName props vdoms =
  Node (None, None, tagName, props, vdoms)

let keyedNode key tagName props vdoms =
  Node (None, Some key, tagName, props, vdoms)

let nsNode namespace tagName props vdoms =
  Node (Some namespace, None, tagName, props, vdoms)

let nsKeyedNode namespace key tagName props vdoms =
  Node (Some namespace, Some key, tagName, props, vdoms)

(* let keyedNode tagName props keyed_vdoms =
  KeyedNode (tagName, props, keyed_vdoms) *)

(* Properties *)

let noProp = NoProp

let prop key value = RawProp (key, value)

let on name cb = Event (name, cb)

let attr key value = Attribute (key, value)

let data key value = Data (key, value)

let style key value = Style [ (key, value) ]

let styles s = Style s

(* Accessors *)

(* Inefficient, but purely for debugging *)
let rec renderToHtmlString = function
  | NoVNode -> ""
  | Text s -> s
  | Node (namespace, key, tagName, props, vdoms) ->
    let rec renderProp = function
      | NoProp -> ""
      | RawProp (k, v) -> String.concat "" [" "; k; "=\""; v; "\""]
      | Attribute (k, v) -> String.concat "" [" "; k; "=\""; v; "\""]
      | Data (k, v) -> String.concat "" [" data-"; k; "=\""; v; "\""]
      | Event (ev, v) -> String.concat "" [" "; ev; "=\"func\""]
      | Style s -> String.concat "" [" style=\""; String.concat ";" (List.map (fun (k, v) -> String.concat "" [k;":";v;";"]) s); "\""]
    in
    String.concat ""
      [ "<"
      ; tagName
      ; String.concat "" (List.map (fun p -> renderProp p) props)
      ; ">"
      ; String.concat "" (List.map (fun v -> renderToHtmlString v) vdoms)
      ; "</"
      ; tagName
      ; ">"
      ]
  (* | KeyedNode (elemType, props, vdoms) -> String.concat ":" ["UNIMPLEMENTED"; elemType] *)


(* Patch elements *)

let applyProperties elem curProperties =
  List.fold_left
    (fun elem -> function
       | NoProp -> elem
       | RawProp (k, v) -> elem
       | Attribute (k, v) -> elem
       | Data (k, v) -> elem
       | Event (ev, v) -> elem
       | Style s -> List.fold_left (fun elem (k, v) -> let () = Web.setStyle elem##style k v in elem) elem s
       (* | Style s -> List.fold_left (fun (k, v) elem -> let _ = elem##style##set k v in elem) elem s *)
    ) elem curProperties


(* Creating actual DOM elements *)
(* let doc = Web.document *)

let createElementFromVNode_addProps properties elem = elem


let rec createElementFromVNode_addChildren children elem =
  List.fold_left (fun n child -> let childelem = n##appendChild (createElementFromVNode child) in n) elem children
    and createElementFromVNode = function
  | NoVNode -> Web.createComment ()
  | Text s -> Web.createTextNode s
  | Node (namespace, _key_unused, tagName, properties, children) ->
    Web.createElementNsOptional namespace tagName
    |> createElementFromVNode_addProps properties
    |> createElementFromVNode_addChildren children

(* Node namespace key tagName properties children  *)
(* | Node of string option * string option * string * 'msg property list * 'msg velem list *)

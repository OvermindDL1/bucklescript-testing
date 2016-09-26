
(* https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md *)


(* Attributes are not properties *)
(* https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes *)

type 'msg property =
  | NoProp
  | RawProp of string * string  (* This last string needs to be made something more generic, maybe a function... *)
  (* Attribute is (namespace, key, value) *)
  | Attribute of string option * string * string
  | Data of string * string
  | Event of string * (Web.Event.t -> 'msg)
  | Style of (string * string) list

type 'msg properties = 'msg property list

type 'msg t =
  | NoVNode
  | Text of string
  (* Node namespace key tagName properties children  *)
  | Node of string * string * string * 'msg properties * 'msg t list
  (* | NSKeyedNode of string option * string * 'msg property list * (int * 'msg t) list *)


(* Nodes *)

let noNode = NoVNode

let text s = Text s

let node tagName props vdoms =
  Node ("", "", tagName, props, vdoms)

let keyedNode key tagName props vdoms =
  Node ("", key, tagName, props, vdoms)

let nsNode namespace tagName props vdoms =
  Node (namespace, "", tagName, props, vdoms)

let nsKeyedNode namespace key tagName props vdoms =
  Node (namespace, key, tagName, props, vdoms)

(* let keyedNode tagName props keyed_vdoms =
  KeyedNode (tagName, props, keyed_vdoms) *)

(* Properties *)

let noProp = NoProp

let prop key value = RawProp (key, value)

let on name cb = Event (name, cb)

let attr key value = Attribute (None, key, value)

let attrNS namespace key value = (Some namespace, key, value)

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
      | Attribute (namespace, k, v) -> String.concat "" [" "; k; "=\""; v; "\""]
      | Data (k, v) -> String.concat "" [" data-"; k; "=\""; v; "\""]
      | Event (typ, v) -> String.concat "" [" "; typ; "=\"js:"; Js.typeof v; "\""]
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


type 'msg applicationCallbacks = {
  enqueue : 'msg -> unit;
}


let applyProperties callbacks elem curProperties =
  List.fold_left
    (fun elem -> function
       | NoProp -> elem
       | RawProp (k, v) -> elem
       | Attribute (namespace, k, v) -> elem
       | Data (k, v) -> elem
       | Event (typ, v) ->
         (* let () = Js.log [|"Event:"; typ|] in *)
         let cb : Web.Event.cb =
           fun [@bs] ev ->
             let msg = v ev in
             !callbacks.enqueue msg in
         let () = Web_node.addEventListener elem typ cb false in
         elem
       | Style s -> List.fold_left (fun elem (k, v) -> let () = Web.Node.setStyle elem k v in elem) elem s
       (* | Style s -> List.fold_left (fun (k, v) elem -> let _ = elem##style##set k v in elem) elem s *)
    ) elem curProperties


(* Creating actual DOM elements *)
(* let doc = Web.document *)

let createElementFromVNode_addProps callbacks properties elem =
  applyProperties callbacks elem properties


let rec createElementFromVNode_addChildren callbacks children elem =
  children |> List.fold_left (fun n child -> let _childelem = Web.Node.appendChild n (createElementFromVNode callbacks child) in n) elem
    and createElementFromVNode callbacks = function
  | NoVNode -> Web.Document.createComment ""
  | Text text -> let () = Js.log ("Text:", text) in Web.Document.createTextNode text
  | Node (namespace, _key_unused, tagName, properties, children) -> let () = Js.log (callbacks, namespace, _key_unused, tagName, properties, children) in
    let child = Web.Document.createElementNsOptional namespace tagName in
    let () = Js.log ("Blooop", child) in
    child
    |> createElementFromVNode_addProps callbacks properties
    |> createElementFromVNode_addChildren callbacks children
    (* Web.Document.createElementNsOptional namespace tagName
    |> createElementFromVNode_addProps callbacks properties
    |> createElementFromVNode_addChildren callbacks children *)


let createVNodesIntoElement callbacks vnodes elem =
  vnodes |> List.fold_left (fun n vnode -> let _childelem = Web.Node.appendChild n (createElementFromVNode callbacks vnode) in n) elem

let createVNodeIntoElement callbacks vnode elem =
  createVNodesIntoElement callbacks [vnode] elem



(* Diffing/Patching *)
(* Very naive right now, but it worksish *)

(* let rec patchVNodesOnElems_DeleteRest elem elems idx =
  if Js.Array.length elems >= idx then -1 else
    let child = elems.(idx) in
    let _removedChild = Web.Node.removeChild elem child in
    patchVNodesOnElems_DeleteRest elem elems idx *)

(* let rec patchVNodesOnElems_Empty callbacks elem elems idx = function
  | [] -> -1
  | NoVNode :: newVNodes ->
    let child = Web.Document.createComment "" in
    let _newChild = Web.Node.appendChild elem child in
    patchVNodesOnElems_Empty callbacks elem elems (idx+1) newVNodes
  | Text text :: newVNodes ->
    let child = Web.Document.createTextNode text in
    let _newChild = Web.Node.appendChild elem child in
    patchVNodesOnElems_Empty callbacks elem elems (idx+1) newVNodes
  | vnode :: newVNodes ->
    let child = createElementFromVNode callbacks vnode in
    let _newChild = Web.Node.appendChild elem child in
    patchVNodesOnElems_Empty callbacks elem elems (idx+1) newVNodes
    (* let child = elems.(idx) in *)
    (* let _child = Web.Node.removeChild elem child in *)
    (* patchVNodesOnElems_Empty callbacks elem elems idx newVNodes (* Not incrementing idx since we just removed something *) *) *)


(* let patchVNodesOnElems_NoVNode callbacks elem elems idx = function
  | [] -> -1
  | NoVNode :: _newRest -> idx + 1
  | Text text :: _newRest -> -42
    (* let child = Web.Document.createComment "" in
    let _attachedChild = Web.Node.appendChild elem child in
    -1 *) *)


(* let patchVNodesOnElems callbacks elem elems idx oldVNodes newVNodes = match oldVNodes with
  | [] -> patchVNodesOnElems_Empty callbacks elem elems idx
  | NoVNode :: oldRest ->
    let newIdx = patchVNodesOnElems_NoVNode callbacks elem elems idx newVNodes in
    if newIdx < 0 then
      patchVNodesOnElems_DeleteRest elem elems idx
    else
      patchVNodesOnElems callbacks elem elems newIdx
  | _ -> fun newish -> Js.log "Blah" *)


let rec patchVNodesOnElems_PropertiesApply callbacks elem oldProperties newProperties = match oldProperties, newProperties with
  | [], [] -> ()
  | [], NoProp :: newRest -> patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | [], RawProp (k, v) :: newRest -> let () = Js.log ("Unhandled RawProp", k, v) in patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | [], Attribute (namespace, k, v) :: newRest -> let () = Js.log ("Unhandled Attribute", namespace, k, v) in patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | [], Data (k, v) :: newRest -> let () = Js.log ("Unhandled Data", k, v) in patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | [], Event (typ, cbev) :: newRest ->
    let cb : Web.Event.cb =
      fun [@bs] ev ->
        let msg = cbev ev in
        !callbacks.enqueue msg in
    Web_node.addEventListener elem typ cb false
  | [], Style s :: newRest ->
    let _elem = List.fold_left (fun elem (k, v) -> let () = Web.Node.setStyle elem k v in elem) elem s in
    patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | prop :: oldRest, [] -> let () = Js.log ("Unhandled Removal", prop) in patchVNodesOnElems_PropertiesApply callbacks elem oldRest []
  | NoProp :: oldRest, NoProp :: newRest -> patchVNodesOnElems_PropertiesApply callbacks elem [] newRest
  | RawProp (oldK, oldV) :: oldRest, RawProp (newK, newV) :: newRest ->
    let () = if oldK = newK && oldV = newV then () else
        Js.log ("Unhandled RawProp", oldK, oldV, newK, newV) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest
  | Attribute (oldNS, oldK, oldV) :: oldRest, Attribute (newNS, newK, newV) :: newRest ->
    let () = if oldNS = newNS && oldK = newK && oldV = newV then () else
        Js.log ("Unhandled Attribute", oldNS, oldK, oldV, newNS, newK, newV) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest
  | Data (oldK, oldV) :: oldRest, Data (newK, newV) :: newRest ->
    let () = if oldK = newK && oldV = newV then () else
        Js.log ("Unhandled Data", oldK, oldV, newK, newV) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest
  | Event (oldTyp, oldCbev) :: oldRest, Event (newTyp, newCbev) :: newRest ->
    let () = if oldTyp = newTyp && oldCbev = newCbev then () else (* TODO:  Figure out if this is a half-decent way of function comaprison, probably not... *)
        Js.log ("Unhandled Event", oldTyp, oldCbev, newTyp, newCbev) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest
  | Style oldS :: oldRest, Style newS :: newRest ->
    let () = if oldS = newS then () else
        Js.log ("Unhandled Style", oldS, newS) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest
  | oldProp :: oldRest, newProp :: newRest ->
    let () = Js.log ("Unhandled property change", oldProp, newProp) in
    patchVNodesOnElems_PropertiesApply callbacks elem oldRest newRest


let patchVNodesOnElems_Properties callbacks elem oldProperties newProperties =
  if oldProperties = newProperties then
    ()
  else
    patchVNodesOnElems_PropertiesApply callbacks elem oldProperties newProperties

     (* | NoProp -> elem
     | RawProp (k, v) -> elem
     | Attribute (namespace, k, v) -> elem
     | Data (k, v) -> elem
     | Event (typ, v) ->
       (* let () = Js.log [|"Event:"; typ|] in *)
       let cb : Web.Event.cb =
         fun [@bs] ev ->
           let msg = v ev in
           !callbacks.enqueue msg in
       let () = Web_node.addEventListener elem typ cb false in
       elem
     | Style s -> List.fold_left (fun elem (k, v) -> let () = Web.Node.setStyle elem k v in elem) elem s *)


(* let patchVNodesOnElems_ReplaceVnodeAt callbacks elem elems idx vnode =
  let child = elems.(idx) in
  let _removedChild = Web.Node.removeChild elem child in
  let newChild = createElementFromVNode callbacks vnode in
  let _attachedChild = Web.Node.appendChild elem newChild in
  () *)

let patchVNodesOnElems_createElement callbacks namespace tagName properties =
    let child = Web.Document.createElementNsOptional namespace tagName in
    let () = patchVNodesOnElems_Properties callbacks child [] properties in
    child

let rec patchVNodesOnElems callbacks elem elems idx oldVNodes newVNodes = let () = Js.log ("test", callbacks, elem, elems, idx, oldVNodes, newVNodes) in match oldVNodes, newVNodes with
  | [], [] -> ()
  | [], NoVNode :: newRest ->
    let child = Web.Document.createComment "" in
    let _attachedChild = Web.Node.appendChild elem child in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Text text :: newRest ->
    let child = Web.Document.createTextNode text in
    let _attachedChild = Web.Node.appendChild elem child in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Node (newNamespace, newKey_unused, newTagName, newProperties, newChildren) :: newRest ->
    let child = patchVNodesOnElems_createElement callbacks newNamespace newTagName newProperties in
    let childChildren = Web.Node.childNodes child in
    let () = patchVNodesOnElems callbacks child childChildren 0 [] newChildren in
    let _attachedChild = Web.Node.appendChild elem child in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | oldVnode :: oldRest, [] ->
    let child = elems.(idx) in
    let _removedChild = Web.Node.removeChild elem child in
    patchVNodesOnElems callbacks elem elems idx oldRest [] (* Not changing idx so we can delete the rest too *)
  | NoVNode :: oldRest, NoVNode :: newRest -> patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | Text oldText :: oldRest, Text newText :: newRest ->
    if oldText = newText then
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else
      let child = elems.(idx) in
      let () = Web.Node.set_nodeValue child newText in
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | Node (oldNamespace, oldKey, oldTagName, oldProperties, oldChildren) :: oldRest,
    Node (newNamespace, newKey, newTagName, newProperties, newChildren) :: newRest ->
    if oldNamespace <> newNamespace || oldKey <> newKey || oldTagName <> newTagName then (* Major structural change then, replace it all *)
      (* let () = patchVNodesOnElems_ReplaceVnodeAt callbacks elem elems idx (Node (newNamespace, newKey, newTagName, newProperties, newChildren)) in *)
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else
      let () = Js.log ( elems.(idx), newTagName, elem, idx, elems, newProperties, newChildren ) in
      let child = elems.(idx) in
      let childChildren = Web.Node.childNodes child in
      let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
      let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | _oldVnode :: oldRest, newVnode :: newRest ->
    Js.log "TODO:  This is incomplete, ran out of time today..."
    (* let child = elems.(idx) in
    let newChild = patchVNodesOnElems_createElement callbacks newNamespace newTagName newProperties in
    let _removedChild = Web.Node.removeChild elem child in
    let () = patchVNodesOnElems callbacks elem elems idx [] [newVnode] in
    patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest *)


let patchVNodesIntoElement callbacks elem oldVNodes newVNodes =
  let () = Js.log "Boop" in
  let elems = Web.Node.childNodes elem in
  patchVNodesOnElems callbacks elem elems 0 oldVNodes newVNodes

let patchVNodeIntoElement callbacks elem oldVNode newVNode =
  patchVNodesIntoElement callbacks elem [oldVNode] [newVNode]


(* Node namespace key tagName properties children  *)
(* | Node of string option * string option * string * 'msg property list * 'msg velem list *)

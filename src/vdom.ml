
(* https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md *)


(* Attributes are not properties *)
(* https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes *)

type 'msg property =
  | NoProp
  | RawProp of string * string  (* This last string needs to be made something more generic, maybe a function... *)
  (* Attribute is (namespace, key, value) *)
  | Attribute of string option * string * string
  | Data of string * string
  (* Event is (type, userkey, callback) *)
  | Event of string * string * (Web.Event.t -> 'msg)
  (* | Event of string * (Web.Event.t -> 'msg) *)
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

(* `on` sets no key, so it will not be updated on the DOM unless its position changes *)
let on name cb = Event (name, "", cb)

let onKey name key cb = Event (name, key, cb)
(* let on name cb = Event (name, cb) *)

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
      | Event (typ, key, v) -> String.concat "" [" "; typ; "=\"js:"; Js.typeof v; "\""]
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
       | Event (typ, _key, v) ->
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

let _handlerName idx =
  "_handler_" ^ (string_of_int idx)

let patchVNodesOnElems_PropertiesApply_Add callbacks elem idx = function
  | NoProp -> ()
  | RawProp (k, v) -> Js.log ("TODO:  Add RawProp Unhandled", k, v); failwith "TODO:  Add RawProp Unhandled"
  | Attribute (namespace, k, v) -> Js.log ("TODO:  Add Attribute Unhandled", namespace, k, v); failwith "TODO:  Add Attribute Unhandled"
  | Data (k, v) -> Js.log ("TODO:  Add Data Unhandled", k, v); failwith "TODO:  Add Data Unhandled"
  | Event (t, k, f) ->
    let () = Js.log ("Adding event", elem, t, k, f) in
    let cb : Web.Event.cb =
      fun [@bs] ev ->
        let msg = f ev in
        !callbacks.enqueue msg in
    let () = Web.Node.setProp_asEventListener elem (_handlerName idx) (Js.Undefined.return cb) in
    Web.Node.addEventListener elem t cb false
  | Style s ->
    List.fold_left (fun () (k, v) -> Web.Node.setStyle elem k v) () s

let patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx = function
  | NoProp -> ()
  | RawProp (k, v) -> Js.log ("TODO:  Remove RawProp Unhandled", k, v); failwith "TODO:  Remove RawProp Unhandled"
  | Attribute (namespace, k, v) -> Js.log ("TODO:  Remove Attribute Unhandled", namespace, k, v); failwith "TODO:  Remove Attribute Unhandled"
  | Data (k, v) -> Js.log ("TODO:  Remove Data Unhandled", k, v); failwith "TODO:  Remove Data Unhandled"
  | Event (t, k, f) ->
    let () = Js.log ("Removing Event", t, f) in
    let () = match Js.Undefined.to_opt (Web.Node.getProp_asEventListener elem (_handlerName idx)) with
      | None -> failwith "Something else has messed with the DOM, inconsistent state!"
      | Some cb -> Web.Node.removeEventListener elem t cb false in
    let () = Web.Node.setProp_asEventListener elem (_handlerName idx) Js.Undefined.empty in
    ()
  | Style s -> Js.log ("TODO:  Remove Style Unhandled", s); failwith "TODO:  Remove Style Unhandled"

let patchVNodesOnElems_PropertiesApply_RemoveAdd callbacks elem idx oldProp newProp =
  let () = patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx oldProp in
  let () = patchVNodesOnElems_PropertiesApply_Add callbacks elem idx newProp in
  ()

let patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp = function
  | NoProp as _newProp -> failwith "This should never be called as all entries through NoProp are gated."
  | RawProp (k, v) as _newProp -> Js.log ("TODO:  Mutate RawProp Unhandled", k, v)
  | Attribute (namespace, k, v) as _newProp -> Js.log ("TODO:  Mutate Attribute Unhandled", namespace, k, v)
  | Data  (k, v) as _newProp -> Js.log ("TODO:  Mutate Data Unhandled", k, v)
  | Event (t, k, f) as newProp -> patchVNodesOnElems_PropertiesApply_RemoveAdd callbacks elem idx oldProp newProp
  | Style s as _newProp -> Js.log ("TODO:  Mutate Style Unhandled", s)

let rec patchVNodesOnElems_PropertiesApply callbacks elem idx oldProperties newProperties = match oldProperties, newProperties with
  | [], [] -> ()
  | [], newProp :: newRest ->
    let () = patchVNodesOnElems_PropertiesApply_Add callbacks elem idx newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) [] newRest
  | oldProp :: oldRest, [] ->
    let () = patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx oldProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) [] oldRest
  (* NoProp *)
  | NoProp :: oldRest, NoProp :: newRest -> patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) [] newRest
  (* RawProp *)
  | (RawProp (oldK, oldV) as oldProp) :: oldRest, (RawProp (newK, newV) as newProp) :: newRest ->
    let () = if oldK = newK && oldV = newV then () else
      patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  (* Attribute *)
  | (Attribute (oldNS, oldK, oldV) as oldProp) :: oldRest, (Attribute (newNS, newK, newV) as newProp) :: newRest ->
    let () = if oldNS = newNS && oldK = newK && oldV = newV then () else
      patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  (* Data *)
  | (Data (oldK, oldV) as oldProp) :: oldRest, (Data (newK, newV) as newProp) :: newRest ->
    let () = if oldK = newK && oldV = newV then () else
      patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  (* Event *)
  (* | Event (oldTyp, oldKey, oldCbev) :: oldRest, Event (newTyp, newKey, newCbev) :: newRest ->
     let () = if oldTyp = newTyp && oldKey = newKey then () else *)
  | (Event (oldTyp, oldKey, oldCbev) as oldProp) :: oldRest, (Event (newTyp, newKey, newCbev) as newProp) :: newRest ->
    (* TODO:  This is such a *BAD* way of doing this, but event removal needs to be passed in the same func as what was
       registered.  So we enforce a string key, which is more than what most virtualdoms allow for at least... *)
    let () = if oldTyp = newTyp && oldKey = newKey then () else
      patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  (* Style *)
  | (Style oldS as oldProp) :: oldRest, (Style newS as newProp) :: newRest ->
    let () = if oldS = newS then () else
      patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  | oldProp :: oldRest, newProp :: newRest ->
    let () = patchVNodesOnElems_PropertiesApply_RemoveAdd callbacks elem idx oldProp newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest


let patchVNodesOnElems_Properties callbacks elem oldProperties newProperties =
  if oldProperties = newProperties then
    ()
  else
    patchVNodesOnElems_PropertiesApply callbacks elem 0 oldProperties newProperties

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

let rec patchVNodesOnElems callbacks elem elems idx oldVNodes newVNodes = match oldVNodes, newVNodes with
  | [], [] -> ()
  | [], NoVNode :: newRest ->
    let newChild = Web.Document.createComment "" in
    let _attachedChild = Web.Node.appendChild elem newChild in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Text text :: newRest ->
    let newChild = Web.Document.createTextNode text in
    let _attachedChild = Web.Node.appendChild elem newChild in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Node (newNamespace, newKey_unused, newTagName, newProperties, newChildren) :: newRest ->
    let newChild = patchVNodesOnElems_createElement callbacks newNamespace newTagName newProperties in
    let childChildren = Web.Node.childNodes newChild in
    let () = patchVNodesOnElems callbacks newChild childChildren 0 [] newChildren in
    let _attachedChild = Web.Node.appendChild elem newChild in
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
      let child = elems.(idx) in
      let childChildren = Web.Node.childNodes child in
      let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
      let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | _oldVnode :: oldRest, NoVNode :: newRest ->
    let child = elems.(idx) in
    let newChild = Web.Document.createComment "" in
    let _attachedChild = Web.Node.insertBefore elem newChild child in
    let _removedChild = Web.Node.removeChild elem child in
    patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | _oldVnode :: oldRest, Text newText :: newRest ->
    let child = elems.(idx) in
    let newChild = Web.Document.createTextNode newText in
    let _attachedChild = Web.Node.insertBefore elem newChild child in
    let _removedChild = Web.Node.removeChild elem child in
    patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
  | _oldVnode :: oldRest, Node (newNamespace, newKey_unused, newTagName, newProperties, newChildren) :: newRest ->
    let child = elems.(idx) in
    let newChild = patchVNodesOnElems_createElement callbacks newNamespace newTagName newProperties in
    let childChildren = Web.Node.childNodes newChild in
    let () = patchVNodesOnElems callbacks newChild childChildren 0 [] newChildren in
    let _attachedChild = Web.Node.insertBefore elem newChild child in
    let _removedChild = Web.Node.removeChild elem child in
    patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest


let patchVNodesIntoElement callbacks elem oldVNodes newVNodes =
  let elems = Web.Node.childNodes elem in
  patchVNodesOnElems callbacks elem elems 0 oldVNodes newVNodes

let patchVNodeIntoElement callbacks elem oldVNode newVNode =
  patchVNodesIntoElement callbacks elem [oldVNode] [newVNode]


(* Node namespace key tagName properties children  *)
(* | Node of string option * string option * string * 'msg property list * 'msg velem list *)

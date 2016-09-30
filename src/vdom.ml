
(* https://github.com/Matt-Esch/virtual-dom/blob/master/docs/vnode.md *)


(* Attributes are not properties *)
(* https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes *)

type 'msg property =
  | NoProp
  | RawProp of string * string (* TODO:  This last string needs to be made something more generic, maybe a function... *)
  (* Attribute is (namespace, key, value) *)
  | Attribute of string option * string * string
  | Data of string * string
  (* Event is (type, userkey, callback) *)
  | Event of string * string * (Web.Node.event -> 'msg option)
  (* | Event of string * (Web.Event.t -> 'msg) *)
  | Style of (string * string) list

type 'msg properties = 'msg property list

type 'msg t =
  | NoVNode
  | Text of string
  (* Node namespace tagName key unique properties children  *)
  | Node of string * string * string * string * 'msg properties * 'msg t list
  (* | NSKeyedNode of string option * string * 'msg property list * (int * 'msg t) list *)


type 'msg applicationCallbacks = {
  enqueue : 'msg -> unit;
}


(* Nodes *)

let noNode = NoVNode

let text s = Text s

let node ?(namespace="") tagName ?(key="") ?(unique="") props vdoms =
  Node (namespace, tagName, key, unique, props, vdoms)

let fullnode namespace tagName key unique props vdoms =
  Node (namespace, tagName, key, unique, props, vdoms)


(* Properties *)

let noProp = NoProp

let prop key value = RawProp (key, value)

(* `on` sets no key, so it will not be updated on the DOM unless its position changes *)
let on name cb = Event (name, "", cb)

let on name ?(key="") cb = Event (name, key, cb)
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
  | Node (namespace, tagName, _key, _unique, props, vdoms) ->
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



(* let applyProperties callbacks elem curProperties =
  List.fold_left
    (fun elem -> function
       | NoProp -> elem
       | RawProp (k, v) -> elem
       | Attribute (namespace, k, v) -> elem
       | Data (k, v) -> elem
       | Event (typ, _key, v) ->
         (* let () = Js.log [|"Event:"; typ|] in *)
         let cb : Web.Node.event_cb =
           fun [@bs] ev ->
             match v ev with
             | None -> ()
             | Some msg -> !callbacks.enqueue msg in
         let () = Web_node.addEventListener elem typ cb false in
         elem
       | Style s -> List.fold_left (fun elem (k, v) -> let () = Web.Node.setStyle elem k (Js.Null.return v) in elem) elem s
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
  | Text text -> Web.Document.createTextNode text
  | Node (namespace, _key_unused, tagName, properties, children) -> (* let () = Js.log (callbacks, namespace, _key_unused, tagName, properties, children) in *)
    let child = Web.Document.createElementNsOptional namespace tagName in
    (* let () = Js.log ("Blooop", child) in *)
    child
    |> createElementFromVNode_addProps callbacks properties
    |> createElementFromVNode_addChildren callbacks children
    (* Web.Document.createElementNsOptional namespace tagName
    |> createElementFromVNode_addProps callbacks properties
    |> createElementFromVNode_addChildren callbacks children *)


let createVNodesIntoElement callbacks vnodes elem =
  vnodes |> List.fold_left (fun n vnode -> let _childelem = Web.Node.appendChild n (createElementFromVNode callbacks vnode) in n) elem

let createVNodeIntoElement callbacks vnode elem =
  createVNodesIntoElement callbacks [vnode] elem *)



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

let _handlerName idx typ =
  "_handler_" ^ (string_of_int idx) ^ typ

let _usercb callbacks f =
  fun ev ->
    match f ev with
    | None -> () (*Js.log "Nothing"*)
    | Some msg -> (*let () = Js.log ("Handling msg", msg) in*) !callbacks.enqueue msg

let patchVNodesOnElems_PropertiesApply_Add callbacks elem idx = function
  | NoProp -> ()
  | RawProp (k, v) -> Web.Node.setProp elem k v
  | Attribute (namespace, k, v) -> Js.log ("TODO:  Add Attribute Unhandled", namespace, k, v); failwith "TODO:  Add Attribute Unhandled"
  | Data (k, v) -> Js.log ("TODO:  Add Data Unhandled", k, v); failwith "TODO:  Add Data Unhandled"
  | Event (t, k, f) ->
    (* let () = Js.log ("Adding event", elem, t, k, f) in *)
    (* let cb : Web.Node.event_cb =
      fun [@bs] ev ->
        (* let () = Js.log ("ON-EVENT", elem, idx, ev) in *)
        match f ev with
        | None -> () (*Js.log "Nothing"*)
        | Some msg -> (*let () = Js.log ("Handling msg", msg) in*) !callbacks.enqueue msg in
        (* let msg = f ev in
           !callbacks.enqueue msg in *) *)
    let cb = _usercb callbacks f in
    let handler : Web.Node.event_cb =
      fun [@bs] ev -> match Js.Undefined.to_opt ev##target with
        | None -> failwith "Element Event called without being attached to an element?!  Report this with minimal test case!"
        | Some target ->
          (* let () = Js.log ("ON-EVENT", elem, idx, ev) in *)
          let userCB = Web.Node.getProp elem (_handlerName idx "cb") in
          userCB ev [@bs] in
    let () = Web.Node.setProp elem (_handlerName idx "cb") (Js.Undefined.return cb) in
    let () = Web.Node.setProp_asEventListener elem (_handlerName idx "") (Js.Undefined.return handler) in
    Web.Node.addEventListener elem t handler false
  | Style s ->
    List.fold_left (fun () (k, v) -> Web.Node.setStyle elem k (Js.Null.return v)) () s

let patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx = function
  | NoProp -> ()
  | RawProp (k, v) -> Web.Node.setProp elem k Js.Undefined.empty
  | Attribute (namespace, k, v) -> Js.log ("TODO:  Remove Attribute Unhandled", namespace, k, v); failwith "TODO:  Remove Attribute Unhandled"
  | Data (k, v) -> Js.log ("TODO:  Remove Data Unhandled", k, v); failwith "TODO:  Remove Data Unhandled"
  | Event (t, k, f) ->
    (* let () = Js.log ("Removing Event", elem, t, k, f) in *)
    let () = match Js.Undefined.to_opt (Web.Node.getProp_asEventListener elem (_handlerName idx)) with
      | None -> failwith "Something else has messed with the DOM, inconsistent state!"
      | Some cb -> Web.Node.removeEventListener elem t cb false in
    let () = Web.Node.setProp elem (_handlerName idx "cb") Js.Undefined.empty in
    let () = Web.Node.setProp_asEventListener elem (_handlerName idx "") Js.Undefined.empty in
    ()
  | Style s -> List.fold_left (fun () (k, v) -> Web.Node.setStyle elem k Js.Null.empty) () s

let patchVNodesOnElems_PropertiesApply_RemoveAdd callbacks elem idx oldProp newProp =
  let () = patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx oldProp in
  let () = patchVNodesOnElems_PropertiesApply_Add callbacks elem idx newProp in
  ()

let patchVNodesOnElems_PropertiesApply_Mutate callbacks elem idx oldProp = function
  | NoProp as _newProp -> failwith "This should never be called as all entries through NoProp are gated."
  | RawProp (k, v) as _newProp ->
    (* let () = Js.log ("Mutating RawProp", elem, oldProp, _newProp) in *)
    Web.Node.setProp elem k v (* Wow setting properties is slow, unsure how to optimize this further though... *)
  | Attribute (namespace, k, v) as _newProp -> Js.log ("TODO:  Mutate Attribute Unhandled", namespace, k, v)
  | Data  (k, v) as _newProp -> Js.log ("TODO:  Mutate Data Unhandled", k, v)
  (* Wow but adding and removing event handlers is slow on the DOM, lets do this to see if it is faster... *)
  (* Initial profiling tests reveal a fairly substantial speed improvement in event handlers switching now! *)
  | Event (t, k, f) as newProp ->
    (* let () = Js.log ("Mutating event", elem, oldProp, newProp) in *)
    let oldT = match oldProp with
      | Event (oldT, oldK, oldF) -> oldT
      | _ -> failwith "This should never be called as all entries to mutate are gated to the same types" in
    if oldT = t then
      let cb = _usercb callbacks f in
      let () = Web.Node.setProp elem (_handlerName idx "cb") (Js.Undefined.return cb) in
      ()
    else patchVNodesOnElems_PropertiesApply_RemoveAdd callbacks elem idx oldProp newProp
  | Style s as _newProp ->
    (* let () = Js.log ("Mutating Style", elem, oldProp, _newProp) in *)
    match oldProp with
    | Style oldS ->
      List.fold_left2 (fun () (ok, ov) (nk, nv) ->
          if ok = nk then
            if ov = nv then
              ()
            else
              Web.Node.setStyle elem nk (Js.Null.return nv)
          else
            let () = Web.Node.setStyle elem ok Js.Null.empty in
            Web.Node.setStyle elem nk (Js.Null.return nv)
        ) () oldS s
    | _ -> failwith "Passed a non-Style to a new Style as a Mutations while the old Style is not actually a style!"

let rec patchVNodesOnElems_PropertiesApply callbacks elem idx oldProperties newProperties =
  (* let () = Js.log ("PROPERTY-APPLY", elem, idx, oldProperties, newProperties) in *)
  match oldProperties, newProperties with
  | [], [] -> ()
  | [], newProp :: newRest ->
    let () = patchVNodesOnElems_PropertiesApply_Add callbacks elem idx newProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) [] newRest
  | oldProp :: oldRest, [] ->
    let () = patchVNodesOnElems_PropertiesApply_Remove callbacks elem idx oldProp in
    patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) [] oldRest
  (* NoProp *)
  | NoProp :: oldRest, NoProp :: newRest -> patchVNodesOnElems_PropertiesApply callbacks elem (idx+1) oldRest newRest
  (* RawProp *)
  | (RawProp (oldK, oldV) as oldProp) :: oldRest, (RawProp (newK, newV) as newProp) :: newRest ->
    (* let () = Js.log ("RawProp Test", elem, idx, oldProp, newProp, oldK = newK && oldV = newV, oldRest, newRest) in *)
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
    (* let () = Js.log ("Event Test", elem, idx, oldProp, newProp, oldTyp = newTyp && oldKey = newKey, oldRest, newRest) in *)
    (* TODO:  This is such a *BAD* way of doing this, but event removal needs to be passed in the same func as what was
       registered.  So we enforce a string key, which is more than what some virtualdoms allow for at least since with
       a key you can have multiple events of the same type registered without issue... *)
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
  (* Profiling here show `=` to be very slow, but testing reveals it to be faster than checking through the properties
     manually on times when there are few to no changes, which is most of the time, so keeping it for now... *)
  (* TODO:  Look into if there is a better way to quick test property comparisons, especially since it likely returns
     false when events are included regardless of anything else. *)
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

(* let patchVNodesOnElems_createElement callbacks namespace tagName properties =
    let child = Web.Document.createElementNsOptional namespace tagName in
    let () = patchVNodesOnElems_Properties callbacks child [] properties in
    child *)

let rec patchVNodesOnElems_ReplaceNode callbacks elem elems idx (Node (newNamespace, newTagName, newKey, newUnique, newProperties, newChildren)) =
  let oldChild = elems.(idx) in
  let newChild = Web.Document.createElementNsOptional newNamespace newTagName in
  let () = patchVNodesOnElems_Properties callbacks newChild [] newProperties in
  let childChildren = Web.Node.childNodes newChild in
  let () = patchVNodesOnElems callbacks newChild childChildren 0 [] newChildren in
  let _attachedChild = Web.Node.insertBefore elem newChild oldChild in
  let _removedChild = Web.Node.removeChild elem oldChild in
  (* let () = Js.log ("Fullswap happened", oldChild, newChild) in *)
  ()

and patchVNodesOnElems callbacks elem elems idx oldVNodes newVNodes = match oldVNodes, newVNodes with
  | [], [] -> ()
  | [], NoVNode :: newRest ->
    let newChild = Web.Document.createComment "" in
    let _attachedChild = Web.Node.appendChild elem newChild in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Text text :: newRest ->
    let newChild = Web.Document.createTextNode text in
    let _attachedChild = Web.Node.appendChild elem newChild in
    patchVNodesOnElems callbacks elem elems (idx + 1) [] newRest
  | [], Node (newNamespace, newTagName, _newKey, _unique, newProperties, newChildren) :: newRest ->
    let newChild = Web.Document.createElementNsOptional newNamespace newTagName in
    let () = patchVNodesOnElems_Properties callbacks newChild [] newProperties in
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
  | Node (oldNamespace, oldTagName, oldKey, oldUnique, oldProperties, oldChildren) :: oldRest,
    (Node (newNamespace, newTagName, newKey, newUnique, newProperties, newChildren) as newNode) :: newRest ->
    if newKey = "" then
      if oldUnique = newUnique then
        (* let () = Js.log ("Node test", "parse", elem, elems.(idx), newNode) in *)
        let child = elems.(idx) in
        let childChildren = Web.Node.childNodes child in
        let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
        let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
        patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
      else
        (* let () = Js.log ("Node test", "unique swap", elem, elems.(idx), newNode) in *)
        let () = patchVNodesOnElems_ReplaceNode callbacks elem elems idx newNode in
        patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else if oldKey = newKey then
      (* let () = Js.log ("Node test", "match", elem, elems.(idx), newNode) in *)
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else (* Keys do not match but do exist *)
      ( match oldRest with
        | Node (olderNamespace, olderTagName, olderKey, olderUnique, olderProperties, olderChildren) :: olderRest ->
          if olderNamespace = newNamespace && olderTagName = newTagName && olderKey = newKey then
            (* Older is perfect match, kill current and advance past *)
              (* let () = Js.log ("Node test", "older match", elem, elems.(idx), newNode) in *)
              let oldChild = elems.(idx) in
              let _removedChild = Web.Node.removeChild elem oldChild in
              patchVNodesOnElems callbacks elem elems (idx+1) olderRest newRest
          else (* Older is not perfect match, do usual parsing, same as the `| _ ->` branch *)
            if oldUnique = newUnique then
              (* let () = Js.log ("Node test", "non-older keyed parse", elem, elems.(idx), newNode) in *)
              let child = elems.(idx) in
              let childChildren = Web.Node.childNodes child in
              let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
              let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
              patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
            else
              (* let () = Js.log ("Node test", "non-older keyed unique swap", elem, elems.(idx), newNode) in *)
              let () = patchVNodesOnElems_ReplaceNode callbacks elem elems idx newNode in
              patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
        | _ -> (* Keys do not match, but do exist, and older does not exist, swap or parse *)
          if oldUnique = newUnique then
            (* let () = Js.log ("Node test", "keyed parse", elem, elems.(idx), newNode) in *)
            let child = elems.(idx) in
            let childChildren = Web.Node.childNodes child in
            let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
            let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
            patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
          else
            (* let () = Js.log ("Node test", "keyed unique swap", elem, elems.(idx), newNode) in *)
            let () = patchVNodesOnElems_ReplaceNode callbacks elem elems idx newNode in
            patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
      )
    (* if newKey = "" || oldKey <> newKey then
      match oldRest with
      | Node (olderNamespace, olderTagName, olderKey, olderUnique, olderProperties, olderChildren) :: olderRest ->
        if oldNamespace <> newNamespace || oldTagName <> newTagName || oldUnique <> newUnique then (* Major structural change.  Replace it all! *)
          if newKey = "" || olderKey <> newKey || oldNamespace <> newNamespace || oldTagName <> newTagName || oldUnique <> newUnique then
            let () = Js.log ("Node swap", "everything older", elem, elems.(idx), newNode) in
            let () = patchVNodesOnElems_ReplaceNode callbacks elem elems idx newNode in
            patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
          else
            let () = Js.log ("Node swap", "skipping", elem, elems.(idx), newNode) in
            (* Actually, the next old one matches, meaning it seems a single thing was removed, so remove this thing, a very common pattern *)
            let oldChild = elems.(idx) in
            let _removedChild = Web.Node.removeChild elem oldChild in
            patchVNodesOnElems callbacks elem elems (idx+1) olderRest newRest
        else
          let () = Js.log ("Node swap", "parsing", elem, elems.(idx), newNode) in
          let child = elems.(idx) in
          let childChildren = Web.Node.childNodes child in
          let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
          let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
          patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
      | _ ->
        let () = Js.log ("Node swap", "everything", elem, elems.(idx), newNode) in
        let () = patchVNodesOnElems_ReplaceNode callbacks elem elems idx newNode in
        patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else (* Identical keys and keys are not "", skip entire subtree *)
      let () = Js.log ("Node swap", "match", elem, elems.(idx), newNode) in
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest *)

    (* if oldNamespace <> newNamespace || oldKey <> newKey || oldTagName <> newTagName then (* Major structural change then, replace it all *)
      (* let () = patchVNodesOnElems_ReplaceVnodeAt callbacks elem elems idx (Node (newNamespace, newKey, newTagName, newProperties, newChildren)) in *)
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest
    else
      let child = elems.(idx) in
      let childChildren = Web.Node.childNodes child in
      let () = patchVNodesOnElems_Properties callbacks child oldProperties newProperties in
      let () = patchVNodesOnElems callbacks child childChildren 0 oldChildren newChildren in
      patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest *)
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
  | _oldVnode :: oldRest, Node (newNamespace, newTagName, _newKey, _unique, newProperties, newChildren) :: newRest ->
    let oldChild = elems.(idx) in
    (* let newChild = patchVNodesOnElems_createElement callbacks newNamespace newTagName newProperties in *)
    let newChild = Web.Document.createElementNsOptional newNamespace newTagName in
    let () = patchVNodesOnElems_Properties callbacks newChild [] newProperties in
    let childChildren = Web.Node.childNodes newChild in
    let () = patchVNodesOnElems callbacks newChild childChildren 0 [] newChildren in
    let _attachedChild = Web.Node.insertBefore elem newChild oldChild in
    let _removedChild = Web.Node.removeChild elem oldChild in
    patchVNodesOnElems callbacks elem elems (idx+1) oldRest newRest


let patchVNodesIntoElement callbacks elem oldVNodes newVNodes =
  let elems = Web.Node.childNodes elem in
  patchVNodesOnElems callbacks elem elems 0 oldVNodes newVNodes

let patchVNodeIntoElement callbacks elem oldVNode newVNode =
  patchVNodesIntoElement callbacks elem [oldVNode] [newVNode]


(* Node namespace key tagName properties children  *)
(* | Node of string option * string option * string * 'msg property list * 'msg velem list *)

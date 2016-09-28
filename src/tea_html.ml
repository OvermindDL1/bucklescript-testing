open Vdom


let text str = text str


(* HTML Elements *)

let div props nodes = node "div" props nodes

let span props nodes = node "span" props nodes

let p props nodes = node "p" props nodes

let a props nodes = node "a" props nodes

let section props nodes = node "section" props nodes

let header props nodes = node "header" props nodes

let footer props nodes = node "footer" props nodes

let h1 props nodes = node "h1" props nodes

let strong props nodes = node "strong" props nodes

let button props nodes = node "button" props nodes

let input props nodes = node "input" props nodes

let label props nodes = node "label" props nodes

let ul props nodes = node "ul" props nodes

let ol props nodes = node "ol" props nodes

let li props nodes = node "li" props nodes


(* Properties *)

let id str = prop "id" str

let href str = prop "href" str

let class' name = prop "className" name

let classList classes =
  classes
  |> List.filter (fun (fst, snd) -> snd)
  |> List.map (fun (fst, snd) -> fst)
  |> String.concat " "
  |> class'

let type' typ = prop "type" typ

let style key value = style key value

let styles s = styles s

let placeholder str = prop "placeholder" str

let autofocus b = if b then prop "autofocus" "autofocus" else noProp

let value str = prop "value" str

let name str = prop "name" str

let checked b = if b then prop "checked" "checked" else noProp

let for' str = prop "for" str

let hidden b = if b then prop "hidden" "hidden" else noProp


(* Events *)

let on typ cb = on typ cb

let _eventGetTarget ev = Js.Undefined.to_opt ev##target

let _eventGetTargetValue ev = match _eventGetTarget ev with
  | None -> None
  | Some target -> Js.Undefined.to_opt target##value

let onInput msg =
  on "input" (fun ev -> Some (msg "Testering"))
    (* (fun ev -> match _eventGetTargetValue ev with
       | None -> failwith "onInput is not attached to something with a target.value on its event"
       | Some value -> cb value
       ) *)

let onClick msg =
  on "click" (fun ev -> Some msg)

let onDoubleClick msg =
  on "dblclick" (fun ev -> Some msg)

let onBlur msg =
  on "blur" (fun ev -> Some msg)

let onFocus msg =
  on "focus" (fun ev -> Some msg)

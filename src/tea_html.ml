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

let on typ ?(key="") cb = on typ ~key:key cb

let onInput ?(key="") msg =
  on "input" ~key:key (*(fun ev -> Some (msg "Testering"))*)
    (fun ev ->
       match Js.Undefined.to_opt ev##target with
       | None -> None
       | Some target -> match Js.Undefined.to_opt target##value with
         | None -> None
         | Some value -> Some (msg value)
    )
    (* (fun ev -> match _eventGetTargetValue ev with
       | None -> failwith "onInput is not attached to something with a target.value on its event"
       | Some value -> msg value
       ) *)

let onClick ?(key="") msg =
  on "click" ~key:key (fun ev -> Some msg)

let onDoubleClick ?(key="") msg =
  on "dblclick" ~key:key (fun ev -> Some msg)

let onBlur ?(key="") msg =
  on "blur" ~key:key (fun ev -> Some msg)

let onFocus ?(key="") msg =
  on "focus" ~key:key (fun ev -> Some msg)

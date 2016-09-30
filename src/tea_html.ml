open Vdom


let text str = text str


(* HTML Elements *)

let div ?(key="") ?(unique="") props nodes = fullnode "" "div" key unique props nodes

let span ?(key="") ?(unique="") props nodes = fullnode "" "span" key unique props nodes

let p ?(key="") ?(unique="") props nodes = fullnode "" "p" key unique props nodes

let a ?(key="") ?(unique="") props nodes = fullnode "" "a" key unique props nodes

let section ?(key="") ?(unique="") props nodes = fullnode "" "section" key unique props nodes

let header ?(key="") ?(unique="") props nodes = fullnode "" "header" key unique props nodes

let footer ?(key="") ?(unique="") props nodes = fullnode "" "footer" key unique props nodes

let h1 ?(key="") ?(unique="") props nodes = fullnode "" "h1" key unique props nodes

let strong ?(key="") ?(unique="") props nodes = fullnode "" "strong" key unique props nodes

let button ?(key="") ?(unique="") props nodes = fullnode "" "button" key unique props nodes

let input ?(key="") ?(unique="") props nodes = fullnode "" "input" key unique props nodes

let label ?(key="") ?(unique="") props nodes = fullnode "" "label" key unique props nodes

let ul ?(key="") ?(unique="") props nodes = fullnode "" "ul" key unique props nodes

let ol ?(key="") ?(unique="") props nodes = fullnode "" "ol" key unique props nodes

let li ?(key="") ?(unique="") props nodes = fullnode "" "li" key unique props nodes


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

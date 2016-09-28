open Vdom


let text str = text str

(* HTML Elements *)

let div props nodes = node "div" props nodes

let section props nodes = node "section" props nodes

let header props nodes = node "header" props nodes

let h1 props nodes = node "h1" props nodes


(* Properties *)

let className name = attr "className" name

let style key value = style key value

let styles s = styles s

let placeholder s = attr "placeholder" s

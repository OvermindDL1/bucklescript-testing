

module Event = Web_event


module Node = Web_node


module Document = Web_document


module Window = Web_window


let polyfills () =
  let () = Node.remove_polyfill () in
  let () = Window.requestAnimationFrame_polyfill () in
  ()

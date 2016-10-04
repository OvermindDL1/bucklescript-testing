

module Event = Web_event


module Node = Web_node


module Document = Web_document


module Date = Web_date


module Window = Web_window


let polyfills () =
  let () = Node.remove_polyfill () in
  let () = Window.requestAnimationFrame_polyfill () in
  ()

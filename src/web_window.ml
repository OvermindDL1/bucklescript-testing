
type timeoutHandlerID = int

type t = <
  clearTimeout : timeoutHandlerID -> unit [@bs.meth];
  requestAnimationFrame : (float -> unit) -> int [@bs.meth];
  setInterval : (unit -> unit) -> int -> timeoutHandlerID [@bs.meth];
  setTimeout : (unit -> unit) -> int -> timeoutHandlerID [@bs.meth];
> Js.t

external window : t = "window" [@@bs.val]


(* requestAnimationFrame callback is a float timestamp in milliseconds *)
let requestAnimationFrame callback = window##requestAnimationFrame callback

let clearTimeout id = window##clearTimeout id

let setInterval cb msTime = window##setInterval cb msTime

let setTimeout cb msTime = window##setTimeout cb msTime



(* Polyfills *)

let requestAnimationFrame_polyfill : unit -> unit = fun () ->
  [%bs.raw{|
  // requestAnimationFrame polyfill
  (function() {
      var lastTime = 0;
      var vendors = ['ms', 'moz', 'webkit', 'o'];
      for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
          window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
          window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                     || window[vendors[x]+'CancelRequestAnimationFrame'];
      }

      if (!window.requestAnimationFrame)
          window.requestAnimationFrame = function(callback, element) {
              var currTime = new Date().getTime();
              var timeToCall = Math.max(0, 16 - (currTime - lastTime));
              var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
              lastTime = currTime + timeToCall;
              return id;
          };

      if (!window.cancelAnimationFrame)
          window.cancelAnimationFrame = function(id) {
              clearTimeout(id);
          };
  }())
  |}]

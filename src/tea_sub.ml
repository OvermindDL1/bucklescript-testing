

type 'msg t =
  | None
  | Batch of 'msg t list


let none = None


let batch subs =
  Batch subs

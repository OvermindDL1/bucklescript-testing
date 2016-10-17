
open Tea.App
open Tea.Html





(* MODEL *)


type model =
  { name : string
  ; password : string
  ; passwordAgain : string
  }


let model =
    { name=""
    ; password=""
    ; passwordAgain=""
    }



(* UPDATE *)


type msg =
  | Name of string
  | Password of string
  | PasswordAgain of string


let update model = function
  | Name name ->
    { model with name }

  | Password password ->
    { model with password }

  | PasswordAgain passwordAgain ->
    { model with passwordAgain }



(* VIEW *)


let viewValidation model =
  let (color, message) =
    if model.password == model.passwordAgain then
      ("green", "OK")
    else
      ("red", "Passwords do not match!")
  in
  div [ styles [("color", color)] ] [ text message ]

let view model =
  div []
    [ input' [ type' "text"; placeholder "Name"; onInput (fun s -> Name s) ] []
    ; input' [ type' "password"; placeholder "Password"; onInput (fun s -> Password s) ] []
    ; input' [ type' "password"; placeholder "Re-enter Password"; onInput (fun s -> PasswordAgain s) ] []
    ; viewValidation model
    ]



let main =
  beginnerProgram
    { model = model
    ; view = view
    ; update = update
    }

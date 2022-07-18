port module Main exposing (..)
import Browser
import Browser.Navigation
import Html exposing (Html, button, div, text)
import Html.Events exposing (onClick)
import Url
import Html.Attributes as Attr


port recievedPage : (Int -> msg) -> Sub msg

-- MAIN


main : Program () Model Msg
main =
    Browser.application
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        , onUrlChange = UrlChanged
        , onUrlRequest = UrlRequested
        }


subscriptions : Model -> Sub Msg
subscriptions _ =
  Sub.batch
  [ recievedPage NextPage
  ]


-- MODEL

type alias Model = Int

initialModel : Model
initialModel = 0


initialCmd : Model -> Cmd Msg
initialCmd _ =
    Cmd.none

init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init _ _ _=
  (initialModel,Cmd.none)


-- UPDATE

type Msg
    = UrlChanged Url.Url
    | UrlRequested Browser.UrlRequest
    | Increment
    | Decrement
    | StateChanged Model
    | NextPage Model


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
  case msg of
    Increment ->
      (model + 1,Cmd.none)

    Decrement ->
      (model - 1,Cmd.none)

    NextPage m ->
        (m,Cmd.none)

    _ ->
      ( model, Cmd.none )


-- VIEW

view : Model -> Browser.Document Msg
view model =
  { title = "URL Interceptor",
    body =
    [ div [ Attr.class "h-full min-h-screen flex flex-col text-white" ]
      [ button [] [ text "Delete all bg-blue-300" ]
      , button [] [ text "next page" ]
      , div [] [ text (String.fromInt model) ]
      ]
    ]
  }

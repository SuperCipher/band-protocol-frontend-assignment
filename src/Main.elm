port module Main exposing (..)

import Browser
import Browser.Navigation
import Html exposing (Html, button, div, text)
import Html.Attributes as Attr
import Html.Events exposing (onClick)
import Url
import Json.Decode as Decode exposing (Decoder, decodeString, float, int, list, string)
import Json.Decode.Pipeline exposing (required)

-- PORT

port recievedPage : (Decode.Value -> msg) -> Sub msg
port requestPage : Int -> Cmd msg


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
        [ recievedPage (\allegedJson ->
                case Decode.decodeValue (list userDecoder) allegedJson of
                    Ok json ->
                       NextPageRecieved json

                    Err e ->
                        DecodeError e
            )

        ]

type alias User =
    { id : String
    }

userDecoder : Decode.Decoder User
userDecoder =
    Decode.succeed User
        |> required "id" string

-- MODEL


type alias Model =
    List User


initialModel : Model
initialModel =
    []


initialCmd : Model -> Cmd Msg
initialCmd _ =
    Cmd.none


init : () -> Url.Url -> Browser.Navigation.Key -> ( Model, Cmd Msg )
init _ _ _ =
    ( initialModel, Cmd.none )



-- UPDATE


type Msg
    = UrlChanged Url.Url
    | UrlRequested Browser.UrlRequest
    | Increment
    | Decrement
    | StateChanged Model
    | NextPageRecieved (List User)
    | DecodeError Decode.Error
    | NextPage Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NextPageRecieved m ->
            ( m, Cmd.none )

        NextPage pageNumber ->
            ( model, requestPage pageNumber )

        _ ->
            ( model, Cmd.none )



-- VIEW


view : Model -> Browser.Document Msg
view model =
    { title = "URL Interceptor"
    , body =
        [ div [ Attr.class "h-full min-h-screen flex flex-col" ]
            [ div [ Attr.class "relative max-w-7xl mx-auto px-4 focus:outline-none sm:px-3 md:px-5" ]
                [ button [ Attr.class "bg-blue-300"] [ text "Delete all" ]
                , button [onClick (NextPage 1)] [ text "next page" ]
                , div [] <| (List.map  (\user -> div [] [ text (user.id) ]) model)
                ]
            ]
        ]
    }

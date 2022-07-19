port module Main exposing (..)

import Browser
import Browser.Navigation
import Html exposing (Html, button, div, img, p, table, td, text, th, tr)
import Html.Attributes as Attr exposing (src)
import Html.Events exposing (onClick)
import Json.Decode as Decode exposing (Decoder, decodeString, float, int, list, string)
import Json.Decode.Pipeline exposing (required)
import Url



-- TODO set by user


offset =
    3



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
        [ recievedPage
            (\allegedJson ->
                case Decode.decodeValue (list userDecoder) allegedJson of
                    Ok json ->
                        NextPageRecieved json

                    Err e ->
                        DecodeError e
            )
        ]


type alias User =
    { id : String
    , username : String
    , joined_date : String
    , profile_image_hash : String
    }


userDecoder : Decode.Decoder User
userDecoder =
    Decode.succeed User
        |> required "id" string
        |> required "username" string
        |> required "joined_date" string
        |> required "profile_image_hash" string



-- MODEL


type alias Model =
    { users : List User
    , currentPage : Int
    }


initialModel : Model
initialModel =
    { users = []
    , currentPage = 0
    }


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
    | PrevPage Int


update : Msg -> Model -> ( Model, Cmd Msg )
update msg model =
    case msg of
        NextPageRecieved receivedUsers ->
            ( { model | users = receivedUsers }, Cmd.none )

        NextPage currentPage ->
            let
                newPage =
                    currentPage + 1

                newPageOffset =
                    newPage * offset
            in
            ( { model | currentPage = newPage }, requestPage newPageOffset )

        PrevPage currentPage ->
            let
                newPage =
                    if currentPage - 1 < 0 then
                        0

                    else
                        currentPage - 1

                newPageOffset =
                    newPage * offset
            in
            ( { model | currentPage = newPage }, requestPage newPageOffset )

        _ ->
            ( model, Cmd.none )



-- TODO refactor UI


tableView : List User -> Html msg
tableView users =
    let
        headerRow =
            tr []
                [ th [] [ text "id" ]
                , th [] [ text "username" ]
                , th [] [ text "joined date" ]
                , th [] [ text "profile image" ]
                ]

        userRows =
            List.map
                (\user ->
                    tr []
                        [ td [ Attr.class "w-40" ] [ text user.id ]
                        , td [ Attr.class "w-40" ] [ text user.username ]

                        -- Date human readable format
                        , td [ Attr.class "w-40" ] [ text user.joined_date ]
                        , td [] [ img [ src ("https://" ++ "api.lorem.space" ++ "/" ++ "image/face" ++ "?w=150&h=150&hash=" ++ user.profile_image_hash) ] [] ]
                        ]
                )
                users
    in
    table []
        (List.append [ headerRow ]
            userRows
        )



-- VIEW
-- TODO UI decoration


view : Model -> Browser.Document Msg
view model =
    { title = "URL Interceptor"
    , body =
        [ div [ Attr.class "h-full min-h-screen flex flex-col" ]
            [ div [ Attr.class "relative max-w-7xl mx-auto px-4 focus:outline-none sm:px-3 md:px-5" ]
                [ -- button [ Attr.class "bg-red-500" ] [ text "Delete all" ],
                  p [] [ text <| (String.fromInt model.currentPage ++ " page number") ]
                , p [] [ text "Sort by joined date , 3 user each page" ]
                , tableView model.users
                , button [ Attr.class "bg-yellow-400", onClick (PrevPage model.currentPage) ] [ text "previous page" ]
                , button [ Attr.class "bg-green-400", onClick (NextPage model.currentPage) ] [ text "next page" ]
                ]
            ]
        ]
    }

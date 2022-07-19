import { Elm } from "./Main.elm";
import React from 'react';
import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloProvider,
  split,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { WebSocketLink } from "@apollo/link-ws";

import { useSubscription, gql } from "@apollo/client";

import { SubscriptionClient } from 'subscriptions-transport-ws';


// Should be in database too
const httpLink = new HttpLink({
  uri: "http://green-feather-500032.ap-south-1.aws.cloud.dgraph.io/graphql", // Or your Slash GraphQL endpoint (if you're using Slash GraphQL)
});

const wsLink = process.browser
  ? new WebSocketLink({
      uri: `wss://green-feather-500032.ap-south-1.aws.cloud.dgraph.io/graphql`, // Can test with your Slash GraphQL endpoint (if you're using Slash GraphQL)
      options: {
        reconnect: true,
      },
    })
  : null;

const splitLink = process.browser
  ? split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    )
  : httpLink;

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
});

// TODO set by UI
const OFFSET: number = 3

async function fetchGraphQL(operationsDoc: any, operationName: any, variables: any) {
  // TODO: environment variables this
  const result = await fetch(
    "https://green-feather-500032.ap-south-1.aws.cloud.dgraph.io/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Auth-Token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJzL3Byb3h5IiwiZHVpZCI6IjB4M2NhMmI5YyIsImV4cCI6MTY1ODA1MDYwNiwiaXNzIjoicy9hcGkifQ.8zgxEzFduQmyw3C2hI9Te3gId3Ki5HybfmmzzXQqSdo"
      },
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName
      })
    }
  );

  return await result.json();
}

// TODO refactor this
function fetchMyQuery(first: number, offset: number, sort: string = "asc", sortBy: string = "joined_date") {
  return fetchGraphQL(
    `
      query ListUser {
        queryUser(order: {${sort}: ${sortBy}}, first: ${first}, offset: ${offset}) {
          id
        }
      }
    `,
    "ListUser",
    {}
  );
}

function subscribeQuery(first: number, offset: number, sort: string = "asc", sortBy: string = "joined_date") {
  // return useSubscription(
  //   gql`
  //     subscription {
  //       queryUser(order: {${sort}: ${sortBy}}, first: ${first}, offset: ${offset}) {
  //         id
  //       }
  //     }
  //   `
  // );
  // // /// call the "subscribe" method on Apollo Client
  this.subscriptionObserver = client.subscribe({
    query:gql`
          subscription userSubscribed {
            queryUser(order: {${sort}: ${sortBy}}, first: ${first}, offset: ${offset}) {
              id
            }
          }
        `,
//         query:gql`
//         subscription MySubscription {
// queryUser {
// id
// joined_date
// profile_image_hash
// username
// }
// }
//             `,
    variables: {}
  }).subscribe({
    next(data) {
    console.log('next DATA')

    console.log('DATA', data)
      // ... call updateQuery to integrate the new comment
      // into the existing list of comments
    },
    error(err) { console.error('err', err); },
  });
}

var elm = Elm.Main.init({ node: document.querySelector("main"), flags: {} });
//
// function subscribe(){
//   const { loading, error, data } = subscribeQuery(3,3);
//   return { loading, error, data }
// }
async function main() {
  subscribeQuery(3,3);
  // console.log('SUBSCRIBE', )

  fetchMyQuery(3, 0).then((fullfilled) => {
    console.log('FULLFILLED', fullfilled.data.queryUser)
    elm.ports.recievedPage.send(fullfilled.data.queryUser);
  }
  )
  elm.ports.requestPage.subscribe((currentPage: number) => {
    fetchMyQuery(3, currentPage).then((fullfilled) => {
      console.log('FULLFILLED', fullfilled.data.queryUser)
      elm.ports.recievedPage.send(fullfilled.data.queryUser);
    })
  })

}

main();

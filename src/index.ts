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

// Move connection stuff to new file
// Should be in database too
const httpLink = new HttpLink({
  uri: "http://green-feather-500032.ap-south-1.aws.cloud.dgraph.io/graphql", // Or your Slash GraphQL endpoint (if you're using Slash GraphQL)
});

const wsLink = process.browser
  ? new WebSocketLink({
      uri: `wss://green-feather-500032.ap-south-1.aws.cloud.dgraph.io/graphql`, // Can test with your Slash GraphQL endpoint (if you're using Slash GraphQL)
      options: {
        reconnect: true,
        connectionParams: () => ({
          authToken: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJzL3Byb3h5IiwiZHVpZCI6IjB4M2NhMmI5YyIsImV4cCI6MTY1ODA1MDYwNiwiaXNzIjoicy9hcGkifQ.8zgxEzFduQmyw3C2hI9Te3gId3Ki5HybfmmzzXQqSdo`,
        }),
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

// TODO refactor this

function subscribeQuery(executeAfter: Function , first: number, offset: number, sort: string = "asc", sortBy: string = "joined_date") {
  this.subscriptionObserver = client.subscribe({
    query:gql`
          subscription userSubscribed {
            queryUser(order: {${sort}: ${sortBy}}, first: ${first}, offset: ${offset}) {
              id
              joined_date
              profile_image_hash
              username
            }
          }
        `,
    variables: {}
  }).subscribe({
    next(queriedData) {
    // NOTE Will leave console.log here for inspection
    console.log('next DATA')
    console.log('subscribed DATA', queriedData)
    executeAfter(queriedData.data.queryUser)
      // ... call updateQuery to integrate the new comment
      // into the existing list of comments
    },
    error(err) { console.error('err', err); },
  });
}

var elm = Elm.Main.init({ node: document.querySelector("main"), flags: {} });

async function main() {
  subscribeQuery(elm.ports.recievedPage.send,OFFSET,0);
  elm.ports.requestPage.subscribe((currentPage: number) => {
    subscribeQuery(elm.ports.recievedPage.send,OFFSET,currentPage);
  })

}

main();

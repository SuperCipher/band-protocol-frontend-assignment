import { Elm } from "./Main.elm";

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

function fetchMyQuery() {
  return fetchGraphQL(
    `
      query MyQuery {
        queryUser(order: {asc: joined_date}, first: 3, offset: 3) {
          id
          username
        }
      }
    `,
    "MyQuery",
    {}
  );
}

var elm = Elm.Main.init({ node: document.querySelector("main"),  flags: {}});

async function main() {
      elm.ports.recievedPage.send(1);
}

main();

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

function fetchMyQuery(first: number, offset: number, sort: string="asc", sortBy: string="joined_date") {
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

var elm = Elm.Main.init({ node: document.querySelector("main"), flags: {} });


async function main() {
  fetchMyQuery(3, 3).then((fullfilled) => console.log('FULLFILLED', fullfilled.data.queryUser)
)
  elm.ports.recievedPage.send(1);
}

main();

const express = require("express");
// Importing the ApolloServer class
const { ApolloServer } = require("apollo-server-express");
const path = require("path");
const db = require("./config/connection");
const { typeDefs, resolvers } = require("./schemas");
const { authMiddleWare } = require("./utils/auth")

const PORT = process.env.PORT || 3000;
const app = express();

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleWare,
  persistedQueries: false,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));
}

// create a new instance of Apollo Server using GraphQL schema
const startApolloServer = async (typeDefs, resovlers) => {
  await server.start();
  server.applyMiddleware({ app });

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, '../client/build/index.html'));
// });

  db.once("open", () => {
    app.listen(PORT, () => {
      console.log(`🌍 Now listening on localhost:${PORT}`);
      console.log(
        `Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`
      );
    });
  });
};

// start server
startApolloServer(typeDefs, resolvers);


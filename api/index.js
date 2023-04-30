import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import https from "https";
import express from "express";
import cors from "cors";
import products from "../db.js";

const app = express();

app.use(cors());
app.use(express.json());

const httpServer = https.createServer(app);

const typeDefs = gql`
  type Rating {
    rate: Float
    count: Int
  }

  type Product {
    id: ID!
    title: String
    price: Float
    description: String
    category: String
    image: String
    rating: Rating
  }

  type Query {
    Product(id: ID!): Product
    allProducts: [Product]
  }
`;

const resolvers = {
  Query: {
    Product: (parent, args, context, info) => {
      const { id } = args;
      return products.find((product) => product.id == id);
    },
    allProducts: () => products,
  },
};

const startApolloServer = async (app, httpServer) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    playground: {
      endpoint: "/graphql",
      settings: {
        "editor.theme": "dark",
      },
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 3004 }, resolve));
  console.log(`🚀 Server ready at http://localhost:3004${server.graphqlPath}`);
};

startApolloServer(app, httpServer);

export default httpServer;

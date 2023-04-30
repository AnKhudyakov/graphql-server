import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { createServer as createHttpsServer } from "https";
import { createServer as createHttpServer } from "http";
import express from "express";
import cors from "cors";
import products from "../db.js";
import { readFileSync } from "fs";

const app = express();

app.use(cors());
app.use(express.json());

// Use Vercel-provided SSL certificate for HTTPS server
const httpsOptions = {
  key: readFileSync("/etc/ssl/private/ssl-cert-snakeoil.key"),
  cert: readFileSync("/etc/ssl/certs/ssl-cert-snakeoil.pem"),
};

// Create HTTP and HTTPS servers
const httpServer = createHttpServer(app);
const httpsServer = createHttpsServer(httpsOptions, app);

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
    cache: {
      type: "memory",
      maxSize: 100 * 1024 * 1024, // 100 MB
      cacheableResponse: {
        statuses: [200],
      },
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();
  server.applyMiddleware({ app });

 // Listen on both HTTP and HTTPS servers
 httpServer.listen({ port: 80 }, () => {
  console.log(`🚀 HTTP server ready`);
});
httpsServer.listen({ port: 443 }, () => {
  console.log(`🚀 HTTPS server ready`);
});
};

startApolloServer(app, httpServer, httpsServer);

import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import {ApolloServer} from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import { typeDefs, resolvers} from "./graphql/index.js";
import connectDB from './utils/dbConnect.js';
import { getUser } from './utils/auth.js';

import routes from "./routes/index.js";

dotenv.config();
connectDB();
const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await server.start();

// routes
app.use("/", routes);
// graphql
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const token  = req.headers.token || "";
      const user = await getUser(token);
      return { user };
    }
  }),
);

app.get("/", (req,res)=>{
  res.send("hello world!");
})


await new Promise((resolve) =>
  httpServer.listen({ port: 4000 }, resolve),
);

console.log(`🚀 Server ready at http://localhost:4000/`);
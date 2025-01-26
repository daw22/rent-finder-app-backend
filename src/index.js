import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import {ApolloServer} from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { ApolloServerPluginLandingPageLocalDefault, ApolloServerPluginLandingPageProductionDefault } from '@apollo/server/plugin/landingPage/default';


import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';

import { typeDefs, resolvers} from "./graphql/index.js";
import connectDB from './utils/dbConnect.js';
import { getUser } from './utils/auth.js';

import routes from "./routes/index.js";

dotenv.config();
connectDB();
const app = express();
const httpServer = http.createServer(app);

// cookie parser
app.use(cookieParser());
// json middleware
app.use(express.json());
// routes
app.use("/", routes);

const schema = makeExecutableSchema({typeDefs, resolvers});

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
    // Landing Page and enable endpoint editing
    process.env.NODE_ENV === 'production'
      ? ApolloServerPluginLandingPageProductionDefault()
      : ApolloServerPluginLandingPageLocalDefault({
        footer: false,
        embed: {
          endpointIsEditable: true
        }
      }),
  ],
});

//create ws server
const wsServer = new WebSocketServer({
  server: httpServer,
  path: "/subscriptions"
})
const serverCleanup = useServer(
  { schema,
    async context(ctx) {
      const { connectionParams } = ctx;
      const token = connectionParams?.token || null;

      if (!token) {
        throw new Error('Authentication token is missing');
      }

      // Authenticate the user
      const user = await getUser(token);
      if (!user) {
        throw new Error('Invalid or expired token');
      }

      return { user }; // Add the user to the WebSocket context
    },
   },
  wsServer
);

await server.start();

// graphql
app.use(
  '/graphql',
  cors(),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      const token  = req.headers.token || "";
      const user = await getUser(token);
      return { user, req, res };
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
import { RedisPubSub } from "graphql-redis-subscriptions";
import Redis from "ioredis";

// Create Redis clients for publishing and subscribing
const options = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT || 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000), // Reconnect strategy
};

// Initialize the Redis PubSub
const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

export default pubsub;
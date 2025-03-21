#!/usr/bin/env node

import Redis, { RedisOptions } from "ioredis";

const {
  REDIS_HOST,
  REDIS_PORT = 6379,
  REDIS_PASSWORD = null,
  REDIS_TLS = false,
} = process.env;

// Redis connection configuration
const redisConfig: RedisOptions = {
  host: REDIS_HOST, // Redis endpoint
  port: REDIS_PORT as number, // Redis port
  password: REDIS_PASSWORD as string, // Redis password
  retryStrategy: (times) => {
    // Reconnect after 5 seconds
    return 5000;
  },
};

if (REDIS_TLS === "true") {
  redisConfig.tls = {
    servername: REDIS_HOST,
  };
}

// Create a Redis client
const client = new Redis(redisConfig);

// Function to check Redis health
async function checkRedisHealth() {
  try {
    console.log("Checking Redis health...");
    const result = await client.ping();
    console.log("PING response:", result); // Should return "PONG"
  } catch (err) {
    console.error("Redis health check failed:", err);
  }
}

// Handle connection events
client.on("connect", () => {
  console.log("Connected to Redis");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

client.on("reconnecting", () => {
  console.log("Reconnecting to Redis...");
});

client.on("end", () => {
  console.log("Redis connection closed");
});

checkRedisHealth();

// Run the health check every 30 seconds
const interval = 5000; // 5 seconds in milliseconds
setInterval(checkRedisHealth, interval);

console.log(`Redis health check will run every ${interval / 1000} seconds...`);

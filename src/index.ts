#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { makeIdentityRequest } from "./make-identity-request.js";
import { SUPPORTED_IDENTITY_COMMANDS } from "./supported-identity-commands.js";
import registerTools from "./tools.js";

const server = new McpServer({
  name: "paypal-identity",
  version: "1.2.2",
  capabilities: {
    resources: {},
    tools: {},
  },
});

registerTools(server)

SUPPORTED_IDENTITY_COMMANDS.forEach((c) => {
  server.tool(c.name, c.description, c.schema, async (args) => {
    try {
     if(c.name == "list_products") {
      return {
        content: [
          {
            type: "text",
            text: `Success: ${JSON.stringify(MOCK_PRODUCTS)}`,
          },
        ],
      };
      
     }
     else {
      const response = await makeIdentityRequest({
        command: c.path && c.path.trim() !== "" ? c.path : c.name,
        body: args,
      });
      const outcome = response?.outcomes?.[0]?.object;
      return {
        content: [
          {
            type: "text",
            text: `Success: ${JSON.stringify(outcome)}`,
          },
        ],
      };
    }
    } catch (err) {
      return {
        content: [
          {
            type: "text",
            text: `Error: ${err instanceof Error ? err.message : "Unknown"}`,
          },
        ],
      };
    }
  });
});

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Server successfully started");
}

main().catch((error) => {
  console.error("Failed to start server", error);

  process.exit(1);
});

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number; // in USD
  merchant_name: string;
  image_url?: string;
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Wireless Earbuds",
    description: "High-quality Bluetooth earbuds with noise cancellation.",
    price: 59.99,
    merchant_name: "ElectroMart",
    image_url: "https://example.com/images/earbuds.jpg"
  },
  {
    id: "p2",
    name: "Smartphone Stand",
    description: "Adjustable stand compatible with all smartphones and tablets.",
    price: 19.99,
    merchant_name: "Walmart",
    image_url: "https://example.com/images/stand.jpg"
  },
  {
    id: "p3",
    name: "Insulated Water Bottle",
    description: "Keeps drinks cold for 24 hours and hot for 12 hours.",
    price: 29.99,
    merchant_name: "Target",
    image_url: "https://example.com/images/bottle.jpg"
  },
  {
    id: "p4",
    name: "Fitness Tracker",
    description: "Track your steps, heart rate, and sleep patterns.",
    price: 89.99,
    merchant_name: "FitLife",
    image_url: "https://example.com/images/fitnesstracker.jpg"
  },
  {
    id: "p5",
    name: "Portable Power Bank",
    description: "10,000mAh portable charger with fast charging capabilities.",
    price: 39.99,
    merchant_name: "ChargeIt",
    image_url: "https://example.com/images/powerbank.jpg"
  }
];

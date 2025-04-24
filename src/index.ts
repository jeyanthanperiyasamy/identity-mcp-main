#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import { z } from "zod";

import { RequestHandlerExtra } from '@modelcontextprotocol/sdk/shared/protocol.js';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { generateChallengeAndSendPushNotification, waitForUserToAcceptThePushNotification, checkoutCompletion } from "./make-identity-request.js";
import { SUPPORTED_IDENTITY_COMMANDS } from "./supported-identity-commands.js";
import registerTools from "./tools.js";

const server = new McpServer({
  name: "paypal-identity",
  version: "1.2.2",
  capabilities: {
    resources: {},
    tools: {},
    logging: {},
    prompts: { 
      identity_checkout_verification_flow: {
        description: "Handles identity verification and checkout using push notifications.",
        instructions: `
You are an identity-based checkout assistant responsible for verifying the user via push notification.

Follow this sequence:

1. Call 'list_products' to display a catalog of products

2. Call the 'generateChallengeAndSendPushNotificationParameters' tool to initiate verification and retrieve the 'context_id'.

3. Using the 'context_id' and 'intent', poll the 'waitForUserToAcceptThePushNotification' tool every 5 seconds, up to 2 minute:
   - If the response status is "completed", proceed to the step 4
   - If the status is "inprogress", continue polling.
   - If the status is "error" or the operation times out, report a failure and exit the flow.

4.  'complete_checkout' tool with the same 'context_id' to finalize the checkout process.
        `.trim(),
      },
    }
  },
});


registerTools(server)


SUPPORTED_IDENTITY_COMMANDS.forEach((tool) => {
  server.tool(
    tool.method,
    tool.description,
    tool.parameters.shape,
    async (arg: any, _extra: RequestHandlerExtra<any, any>) => {
      const result = await run(tool.method, arg);
      return {
        content: [
          {
            type: 'text' as const,
            text: String(result),
          },
        ],
      };
    }
  );
});


async function run(method: string, arg: any): Promise<string> {
  try {
    // console.log(`Establishing SSE stream for session ${arg}`)
    const output = await executeMethod(method, arg);
    return JSON.stringify(output);
  } catch (error: any) {
    const errorMessage = error.message || 'Unknown error';
    return JSON.stringify({
      error: {
        message: errorMessage,
        type: 'paypal_error',
      },
    });
  }
}

async function executeMethod(method: string, arg: any): Promise<any> {
  switch (method) {
    case 'initiate_checkout_verification':
      return generateChallengeAndSendPushNotification(arg);
    case 'list_products':
      return MOCK_PRODUCTS;  
    case 'wait_for_user_verification':
      return waitForUserToAcceptThePushNotification(arg)
      case 'complete_checkout':
        return checkoutCompletion(arg)  
    default:
      throw new Error(`Invalid method: ${method}`);  
  }}

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

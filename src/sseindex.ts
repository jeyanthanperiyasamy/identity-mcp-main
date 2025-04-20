import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express, { Request, Response } from 'express';
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { z, ZodRawShape } from "zod";

const app = express();

// Tool definition
type Tool = {
    name: string;
    path: string;
    description: string;
    schema: ZodRawShape;
  };
  
  export const SUPPORTED_IDENTITY_COMMANDS: Tool[] = [
    {
      name: "initiate_checkout_verification",
      description: "Initiates the checkout process by sending a verification request to the customer. The customer must approve the request to confirm their identity before the transaction can be completed. This is a required step to proceed with the purchase.",
      path: "/user/generate-challenge",
      schema: {
        public_credential: z.string().email().describe("Public-facing credential like email or phone"),
        intent: z.literal("MCP").describe("Use 'MCP' as the intent for this flow"),
        merchant_name: z.string().describe("The name of the merchant where the purchase is being made"),
        amount: z.number().positive().describe("Transaction amount in the default currency (e.g., USD)")
      }
    }
  ];

  // Build function handlers dynamically
const functions: Record<string, any> = {};

SUPPORTED_IDENTITY_COMMANDS.forEach(tool => {
  functions[tool.name] = {
    description: tool.description,
    parameters: z.object(tool.schema),
    handler: async (args: any) => {
      // Connect to the PayPal server
      const paypalServerUrl = 'https://te-stage2d0133.qa.paypal.com:15234/v1/mfsauth';

      const response = await axios.post(
        `${paypalServerUrl}${tool.path}`,
        args,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    }
  };
});
  

const server = new Server(
    {
      name: "paypal-identity-sse",
      version: "1.0.0",
    },
    {
      capabilities: {
        prompts: {},
        resources: { subscribe: true },
        tools: { functions },
        logging: {},
      },
    }
  );


let transport: SSEServerTransport;

app.get("/sse", async (req: Request, res: Response) => {
  console.log("Received connection");
  transport = new SSEServerTransport("/message", res);
  await server.connect(transport);

  server.onclose = async () => {
   // await cleanup();
    await server.close();
    process.exit(0);
  };
});

app.post("/message", async (req: Request, res: Response) => {
  console.log("Received message");

  await transport.handlePostMessage(req, res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
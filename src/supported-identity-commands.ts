process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { z, ZodRawShape } from "zod";

type Tool = {
  name: string;
  path: string;
  description: string;
  schema: ZodRawShape;
};

// TODO: Generate this from the Identity/Openapi docs?
export const SUPPORTED_IDENTITY_COMMANDS: Tool[] = [
  {
    name: "initiate_checkout_verification",
    description: "Initiates the checkout process by sending a verification request to the customer. The customer must approve the request to confirm their identity before the transaction can be completed. This is a required step to proceed with the purchase.",
    path: "/user/generate-challenge",
    schema: {
      public_credential: z
        .string()
        .email()
        .describe("Public-facing credential like email or phone"),
      intent: z
        .literal("MCP")
        .describe("Use 'MCP' as the intent for this flow"),
      merchant_name: z
        .string()
        .describe("The name of the merchant where the purchase is being made"),
      amount: z
        .number()
        .positive()
        .describe("Transaction amount in the default currency (e.g., USD)")
    }
  }
];

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
  },
  {
    name: "create-buyer",
    description: "Create a PayPal test buyer user via JAWS and extra quality of life additions",
    path: "",
    schema: {
      buyer_country_code: z
        .string()
        .length(2)
        .describe("Abbreviated country name. Ex: US, GB, etc."),
      first_name: z
        .string()
        .optional()
        .describe("Optional first name of the user to create"),
      last_name: z
        .string()
        .optional()
        .describe("Optional last name of the user to create"),
    }
  },
  {
    name: "create-merchant",
    description: "Create a PayPal test merchant user via JAWS and extra quality of life additions",
    path: "",
    schema: {
      merchant_country_code: z
        .string()
        .length(2)
        .describe("Abbreviated country name. Ex: US, GB, etc.")
    }
  },
  {
    name: "setup-checkout",
    description: "Create a PayPal checkout session",
    path: "",
    schema: {
      country_code: z
        .string()
        .length(2)
        .describe("Abbreviated country name. Ex: US, GB, etc."),
      currency_code: z
        .string()
        .min(3)
        .describe("Abbreviated currency code. Ex: USD, GBP, etc."),
      account_number: z
        .string()
        .optional()
        .describe("Optional account number of the user checkout out"),
      txn_amount: z
        .number()
        .optional()
        .describe("Optional amount of the transaction"),
    },
  }
];

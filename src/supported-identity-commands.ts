process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import { z, ZodRawShape } from "zod";

export type Tool = {
  method: string;
  name: string;
  description: string;
  parameters: z.ZodObject<any, any, any, any>;
  actions: {
    [key: string]: {
      [action: string]: boolean;
    };
  };
};

export const generateChallengeAndSendPushNotificationParameters = () =>
  z.object({
    public_credential: z.string().describe('Public-facing credential, such as an email address or phone number.'),
    intent: z.string().describe("Use 'MCP' as the intent for this flow. Defaults to 'MCP' if not provided."),
    merchant_name: z.string().describe('The name of the merchant where the purchase is being made.'),
    amount: z.number().positive().describe('The transaction amount in the default currency (e.g., USD).'),
  });

  export const generateChallengeAndSendPushNotificationPrompt= () => `
Send an push notification to the customer and get the context_id.
This function sends a push notification  created invoice to its intended recipients.
`;


export const waitForUserToAcceptThePushNotificationParameters = () =>
  z.object({
    context_id: z.string().describe('context_id received from the generate challege'),
    intent: z.string().describe("Use 'MCP-POLL' as the intent for this flow. Defaults to 'MCP-POLL' if not provided."),
  });

  export const waitForUserToAcceptThePushNotificationPrompt = () => "Waits for the status of a previously initiated verification request by polling every 5 seconds, with a maximum timeout of 30 seconds. " +
  "This determines whether the customer has approved the request or if the operation remains pending. " +
   "If no successful response is received within the timeout period, the system should treat it as a user timeout."
;

// TODO: Generate this from the Identity/Openapi docs?
export const SUPPORTED_IDENTITY_COMMANDS: Tool[] = [
  {
    name: "initiate_checkout_verification",
    method: "initiate_checkout_verification",
    description:
      "Initiates the checkout process by sending a verification request (push notification) to the customer. " +
      "The customer must approve the request to confirm their identity before the transaction can proceed. " +
      "The LLM must wait for the customer's response. If the customer approves, the system will exchange the verification for an authorization token and complete the checkout. " +
      "If the polling status returns 'inprogress', 'error', or if a timeout occurs, the LLM should treat it as a user timeout and report it accordingly.",
    parameters: generateChallengeAndSendPushNotificationParameters(),
    actions: {
      checkout: {
        get: true,
      },
    },
  },
  {
    name: "list_products",
    description: "Retrieves the list of available products in the merchant's catalog.",
    method: "list_products",
    parameters: z.object({}),
    actions: {
      checkout: {
        get: true,
      },
    },
  },
  {
    name: "wait_for_user_verification",
    method: "wait_for_user_verification",
description:
  "Waits for the status of a previously initiated verification request by polling every 5 seconds, with a maximum timeout of 30 seconds. " +
  "This determines whether the customer has approved the request or if the operation remains pending. " +
  "If no successful response is received within the timeout period, the system should treat it as a user timeout.",
    parameters: waitForUserToAcceptThePushNotificationParameters(),
    actions: {
      checkout: {
        get: true,
      },
    },
  },
];

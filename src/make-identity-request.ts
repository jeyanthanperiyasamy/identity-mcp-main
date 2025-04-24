process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import axios from 'axios';

import nodeFetch from "node-fetch";
import https from "https";

import debug from "debug";
import { TypeOf } from "zod";

import {generateChallengeAndSendPushNotificationParameters, waitForUserToAcceptThePushNotificationParameters, completeCheckoutParameters} from "./supported-identity-commands.js"

const contextStore: Record<string, { completed: boolean; token?: string }> = {};

const logger = debug('make-identity-request');

// const IDENTITY_URL = "http://localhost:3000";
// const IDENTITY_URL = "https://www.stage2d0133.stage.paypal.com/v1/mfsauth"
 const IDENTITY_URL = "https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge"
//const IDENTITY_URL = "https://te-stage2d0133.qa.paypal.com:15234/v1/mfsauth"


// Create an HTTPS agent that ignores invalid SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: "TLS_method", // Allow any TLS version
  ciphers: 'ALL',              // Allow all ciphers (including weak ones)
  honorCipherOrder: true,   
});


const USER_AGENT = "weather-app/1.0";

 type ToolRequest = {
  command: string;
  body: any;
};

type PollRequest = {
  command: string;
  body: any;
  schema: any
};

interface GenerateChallengeResult {
  contextId: string;
  objectType: string;
}

interface GeneratePollingResult {
  status: string;
  objectType: string;
}

export async function generateChallengeAndSendPushNotification(params: TypeOf<ReturnType<typeof generateChallengeAndSendPushNotificationParameters>>): Promise<any> {
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': 'Basic QVY5QThoQzlpdG4zUnBaLU9lU05LcTNPczl1NjBIbUZpMFIzS0NfQVlTWVlLd1AxbUhWSEJYREpJVDdpOg==',
  };

  // console.log(`Establishing SSE stream for session ${params}`)
  const response = await initiateChallenge(params, headers);

  // const value = {context_id: response.contextId, intent: "MCP-POLL"}
  // const poll = await pollForCompletion(value)

  // console.log(`Establishing SSE stream for session ${response}`)
  return response

  // try {
  //   const response = await initiateChallenge(body, headers);
  //   //const pollResult = await pollForCompletion(contextId, headers);
  //   return buildSuccessResponse(pollResult);
  // } catch (error) {
  //   logger('Error during identity workflow:', error);
  //   return buildErrorResponse(error);
  // }
}

async function initiateChallenge(body: any, headers: any): Promise<GenerateChallengeResult> {
  const response = await axios.post<GenerateChallengeResult>(
    'https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge',
    body,
    { headers }
  );
  return response.data;
}

async function pollForCompletion(params: TypeOf<ReturnType<typeof waitForUserToAcceptThePushNotificationParameters>>): Promise<any> {
  const maxPollingTimeMs = 60_000; // 50 seconds
  const pollingIntervalMs = 5_000; // 5 seconds
  const startTime = Date.now();

  while (Date.now() - startTime < maxPollingTimeMs) {
    const pollResponse = await waitForUserToAcceptThePushNotification(params);
    const status = pollResponse.status;
    if (status === 'completed') {
      contextStore[params.context_id].completed = true;
      contextStore[params.context_id].token = `mock-auth-token-${params.context_id}`;
      return pollResponse;
    }
    // wait for 5 seconds for the next poll
    await delay(pollingIntervalMs);
  }
  throw new Error('Polling timed out after 50 seconds');
}

export async function waitForUserToAcceptThePushNotification(params: TypeOf<ReturnType<typeof waitForUserToAcceptThePushNotificationParameters>>): Promise<GeneratePollingResult> {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic QVY5QThoQzlpdG4zUnBaLU9lU05LcTNPczl1NjBIbUZpMFIzS0NfQVlTWVlLd1AxbUhWSEJYREpJVDdpOg==',
    };
  
    const response = await axios.post<GeneratePollingResult>(
      'https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge',
      params,
      { headers }
    );

    logger('Polling response received:', response.data);
    if(response.data.status === "completed") {

      if (!contextStore[params.context_id]) {
        contextStore[params.context_id] = {
          completed: true,
          token: `mock-auth-token-${params.context_id}`,
        };
      }
    }
    return response.data
}

export async function checkoutCompletion(params: TypeOf<ReturnType<typeof completeCheckoutParameters>>): Promise<{status: string}> {
  const context = contextStore[params.context_id];
  if (!context || !context.token ||context.token.length === 0) {
    throw new Error(`Invalid token or token does not exist ${context?.completed ?? "error in completion"}, ${context?.token ?? "undefined token"}`);
  }
  return {status: `checkout_completed ${context.token}`}
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
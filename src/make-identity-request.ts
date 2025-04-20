process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import nodeFetch from "node-fetch";
import https from "https";

// const IDENTITY_URL = "http://localhost:3000";
// const IDENTITY_URL = "https://www.stage2d0133.stage.paypal.com/v1/mfsauth"
// const IDENTITY_URL = "https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge"
const IDENTITY_URL = "https://te-stage2d0133.qa.paypal.com:15234/v1/mfsauth"


// Create an HTTPS agent that ignores invalid SSL certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
  secureProtocol: "TLS_method", // Allow any TLS version
  ciphers: 'ALL',              // Allow all ciphers (including weak ones)
  honorCipherOrder: true,   
});

const USER_AGENT = "weather-app/1.0";

export type ToolRequest = {
  command: string;
  body: any;
};

export async function makeIdentityRequest({
  command,
  body,
}: ToolRequest): Promise<any> {
  try {
    const header = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': 'Basic QVY5QThoQzlpdG4zUnBaLU9lU05LcTNPczl1NjBIbUZpMFIzS0NfQVlTWVlLd1AxbUhWSEJYREpJVDdpOg=='
    }
    const response = await axios.post(
      'https://api.sandbox.paypal.com/v1/mfsauth/user/generate-challenge',
      body,
      {
        headers: header
      }
    );

    return {
      content: [
        {
          type: "text",
          text: { message: 'Success', data: response.data }
        },
      ],
    };
  
    } catch (error) {
      console.error('Error calling PayPal server:', error);
      return {
        content: [
          {
            type: "text",
            text: { message: 'Error', error: String(error) }
          },
        ],
      };
    }
}

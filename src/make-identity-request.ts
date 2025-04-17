process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

import nodeFetch from "node-fetch";

const IDENTITY_URL = "https://te-stage2d0133.qa.paypal.com:15234/v1/mfsauth";
const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

type ToolRequest = {
  command: string;
  body: any;
};

export async function makeIdentityRequest({
  command,
  body,
}: ToolRequest): Promise<any> {
  const url = `${IDENTITY_URL}${command}`;

  const response = await nodeFetch(url, {
    method: "POST",
    body: JSON.stringify(body),
    headers: {
      Accept: "application/json",
      ["Content-Type"]: "application/json",
      ["Client-Id"]: "identity-mcp",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to call IDENTITY: ${response.status}`);
  }

  return response.json();
}

#!/usr/bin/env node

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { makeIdentityRequest } from "./make-identity-request.js";
import { SUPPORTED_IDENTITY_COMMANDS } from "./supported-identity-commands.js";
import registerTools from "./tools.js";

const server = new McpServer({
  name: "identity",
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

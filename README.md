# ✨ Identity MCP

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for Identity

## Prerequisities

1. Ensure you're on Node 18+

```
node -v
```

2. Ensure you're pointing to the `https://npm.dev.paypalinc.com/` NPM registry

```
 npm config get registry
```

## Usage

Add the Identity MCP definition in your favorite MCP client:

```json
{
  "mcpServers": {
    ...
    "identity": {
      "command": "npx",
      "args": ["-y", "@paypalcorp/identity-mcp"]
    }
    ...
  }
}
```

## Capabilities

- ✅ Create Pushnotifications
- ✅ Poll Push notification
- ✅ Create a invoice
- ✅ Complete checkout


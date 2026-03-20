# n8n-nodes-recram

This is an n8n community node for [RecRam](https://recram.com) — the AI-powered video survey platform.

## Features

### RecRam Trigger
Starts a workflow when a RecRam event occurs:
- **Form Response Completed** — Triggered after all video processing and AI analysis
- **Form Response Submitted** — Triggered immediately on submission

### RecRam (Actions)
Interact with the RecRam API:
- **Forms**: List all, Get by ID
- **Responses**: List all, Get by ID

## Setup

1. In RecRam, go to **Settings → API Keys** and create a new key with `webhooks:read`, `webhooks:write`, `forms:read`, `answers:read` scopes
2. In n8n, add **RecRam API** credentials with your API key
3. Add a **RecRam Trigger** node and select the event type
4. Activate the workflow — webhook is automatically registered

## Installation

### Community Nodes (recommended)

1. Go to **Settings → Community Nodes**
2. Select **Install a community node**
3. Enter `n8n-nodes-recram`
4. Agree to the risks and install

### Manual

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-recram
```

## Resources

- [RecRam Website](https://recram.com)
- [RecRam Help Center](https://recram.com/help)

## License

MIT

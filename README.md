# Custom Proxy Server (Node.js)

This is a full-featured proxy for web browsing with:
- HTTP/HTTPS proxying
- Logging
- Basic firewall (block/allow list)
- Basic threat protection
- Simple API for logs and firewall control

## How to Run

1. Install Node.js (https://nodejs.org/)
2. In this folder, run:
	```bash
	node custom-proxy/server.js
	```
3. The proxy will listen on port 8080. The API server (for logs/firewall) is on 8081.

## Features
- **Proxy**: Set your browser to use `localhost:8080` as HTTP/HTTPS proxy.
- **Logs**: View logs at http://localhost:8081/logs
- **Firewall**: Block a host via http://localhost:8081/block?host=example.com
- **Threat Protection**: Blocks requests with suspicious keywords (expandable).

## Next Steps
- Connect your dashboard UI to the API endpoints for live logs and firewall control.
- Expand threat protection and authentication as needed.

---
MIT License

// custom-proxy/server.js
// Node.js HTTP/HTTPS proxy with logging, firewall, and basic threat protection (expandable)

const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');

const PORT = 8080;
const BLOCKED_HOSTS = new Set(); // Add domains/IPs to block
const LOGS = [];

function log(message) {
  const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
  LOGS.push(entry);
  if (LOGS.length > 100) LOGS.shift();
  console.log(entry);
}

function isThreat(reqUrl) {
  // Basic threat detection: block known bad domains/keywords
  const badKeywords = ['malware', 'phishing', 'suspicious'];
  return badKeywords.some(k => reqUrl.includes(k));
}

const server = http.createServer((clientReq, clientRes) => {
  const parsedUrl = url.parse(clientReq.url);
  const hostname = parsedUrl.hostname || clientReq.headers['host'];

  if (BLOCKED_HOSTS.has(hostname)) {
    log(`Blocked by firewall: ${hostname}`);
    clientRes.writeHead(403); clientRes.end('Blocked by firewall');
    return;
  }
  if (isThreat(clientReq.url)) {
    log(`Threat detected: ${clientReq.url}`);
    clientRes.writeHead(403); clientRes.end('Blocked by threat protection');
    return;
  }

  log(`Proxying: ${clientReq.method} ${clientReq.url}`);
  const proxyReq = http.request({
    hostname: hostname,
    port: 80,
    path: parsedUrl.path,
    method: clientReq.method,
    headers: clientReq.headers
  }, (proxyRes) => {
    clientRes.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(clientRes, { end: true });
  });
  clientReq.pipe(proxyReq, { end: true });
});

// HTTPS tunneling (CONNECT method)
server.on('connect', (req, clientSocket, head) => {
  const [host, port] = req.url.split(':');
  if (BLOCKED_HOSTS.has(host)) {
    log(`Blocked by firewall: ${host}`);
    clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    clientSocket.end();
    return;
  }
  if (isThreat(host)) {
    log(`Threat detected: ${host}`);
    clientSocket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    clientSocket.end();
    return;
  }
  const serverSocket = net.connect(port || 443, host, () => {
    clientSocket.write('HTTP/1.1 200 Connection Established\r\n\r\n');
    serverSocket.write(head);
    serverSocket.pipe(clientSocket);
    clientSocket.pipe(serverSocket);
  });
});

server.listen(PORT, () => {
  log(`Custom proxy server running on port ${PORT}`);
});

// Simple API for logs and firewall (expand as needed)
const api = http.createServer((req, res) => {
  if (req.url === '/logs') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(LOGS));
  } else if (req.url.startsWith('/block?host=')) {
    const host = req.url.split('=')[1];
    BLOCKED_HOSTS.add(host);
    log(`Host blocked via API: ${host}`);
    res.end('Blocked');
  } else {
    res.writeHead(404); res.end('Not found');
  }
});
api.listen(8081, () => log('API server on 8081'));

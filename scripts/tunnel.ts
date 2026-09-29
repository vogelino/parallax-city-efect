import localtunnel from "localtunnel";
import { createServer } from "vite";

const vite = await createServer({
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
    // The temporary LocalTunnel hostname changes on every run.
    allowedHosts: true,
  },
});

let closeTunnel = () => {};
let shuttingDown = false;

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  closeTunnel();
  await vite.close();
  process.exit(exitCode);
}

try {
  await vite.listen();

  const server = vite.httpServer;

  if (!server) {
    throw new Error("Vite started without an HTTP server.");
  }

  const address = server.address();
  const port = typeof address === "object" && address ? address.port : 5173;

  const tunnel = await localtunnel({
    port,
    local_host: "127.0.0.1",
  });
  closeTunnel = () => tunnel.close();

  console.log(`\nHTTPS tunnel ready: ${tunnel.url}`);
  console.log("Open that URL on the iPhone, then tap Enable tilt.");
  console.log("Keep this process running; press Ctrl+C to close the tunnel.\n");

  tunnel.on("error", (error: Error) => {
    console.error("Tunnel error:", error.message);
  });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Could not start the HTTPS tunnel:", message);
  await shutdown(1);
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

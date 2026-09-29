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

let tunnel;
let shuttingDown = false;

async function shutdown(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  tunnel?.close();
  await vite.close();
  process.exit(exitCode);
}

try {
  await vite.listen();

  const address = vite.httpServer.address();
  const port = typeof address === "object" && address ? address.port : 5173;

  tunnel = await localtunnel({
    port,
    local_host: "127.0.0.1",
  });

  console.log(`\nHTTPS tunnel ready: ${tunnel.url}`);
  console.log("Open that URL on the iPhone, then tap Enable tilt.");
  console.log("Keep this process running; press Ctrl+C to close the tunnel.\n");

  tunnel.on("error", (error) => {
    console.error("Tunnel error:", error.message);
  });
} catch (error) {
  console.error("Could not start the HTTPS tunnel:", error.message);
  await shutdown(1);
}

process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

import { defineConfig } from "cypress";
import { spawn, ChildProcess } from "child_process";

let server: ChildProcess | null = null;
let baseUrl: string | undefined;

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      require('@cypress/code-coverage/task')(on, config);

      on("task", {
        startServer() {
          return new Promise<string>((resolve, reject) => {
            // Check if the server is already running
            if (server) {
              resolve(baseUrl || '');
            }

            server = spawn("node", ["-r", "ts-node/register", "index-test.ts"]);

            // Null check before accessing server.stdout
            if (server.stdout) {
              server.stdout.on("data", (data: Buffer) => {
                console.log(data.toString()); // Log the output for debugging
                if (data.toString().includes("Demo project at:")) {
                  const baseUrlPrefix = "Demo project at: ";
                  const startIndex = data.toString().indexOf(baseUrlPrefix);
                  if (startIndex !== -1) {
                    baseUrl = data
                      .toString()
                      .substring(startIndex + baseUrlPrefix.length)
                      .trim();
                    resolve(baseUrl);
                  }
                }
              });
            }

            if (server.stderr) {
              server.stderr.on("data", (data: Buffer) => {
                reject(data.toString());
              });
            }
          });
        },

        stopServer() {
          if (server) {
            server.kill();
          }
          return null;
        },
      });

      return config;
    },
  },
});

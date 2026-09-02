import { spawn } from "node:child_process";
import process from "node:process";
import path from "node:path";

const repo = path.resolve(import.meta.dirname, "..");
const web = path.join(repo, "apps/web");
const artifactDir = process.env.HERMES_VISUAL_ARTIFACT_DIR;
if (!artifactDir) throw new Error("HERMES_VISUAL_ARTIFACT_DIR is required");

const waitFor = async (url) => {
  const deadline = Date.now() + 180_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 400) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 1_000));
  }
  throw new Error(`visual server did not become ready: ${url}`);
};

let server;
let baseURL = process.env.HERMES_VISUAL_BASE_URL;
try {
  if (!baseURL) {
    server = spawn("pnpm", ["--filter", "@sbgg/web", "start"], {
      cwd: repo, env: process.env, detached: true, stdio: "inherit",
    });
    baseURL = "http://127.0.0.1:3000";
    await waitFor(baseURL + "/how-it-works");
  }
  const dockerEnv = Object.fromEntries(
    ["PATH", "HOME", "DOCKER_HOST"].flatMap((name) => process.env[name] ? [[name, process.env[name]]] : [])
  );
  const args = [
    "run", "--rm", "--network", "host", "--ipc", "host",
    "--user", `${process.getuid()}:${process.getgid()}`,
    "-v", `${repo}:${repo}`,
    "-v", `${artifactDir}:${artifactDir}`,
    "-w", web,
    "-e", `HERMES_VISUAL_BASE_URL=${baseURL}`,
    "-e", `HERMES_VISUAL_ARTIFACT_DIR=${artifactDir}`,
    "-e", "CI=1", "-e", "TZ=UTC", "-e", "PLAYWRIGHT_BROWSERS_PATH=/ms-playwright",
    "mcr.microsoft.com/playwright:v1.62.1-noble",
    "node_modules/.bin/playwright", "test", "e2e/hermes-visual.spec.ts",
    "--project=visual-chromium", "--project=visual-webkit", "--project=visual-firefox",
  ];
  const test = spawn("docker", args, { cwd: repo, env: dockerEnv, stdio: "inherit" });
  const code = await new Promise((resolve) => test.on("exit", (value) => resolve(value ?? 1)));
  process.exitCode = code;
} finally {
  if (server?.pid) {
    try { process.kill(-server.pid, "SIGTERM"); } catch {}
  }
}

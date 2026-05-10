#!/usr/bin/env node
// Pre-start cleanup for `next dev`:
//   1. If .next/dev/lock points to a live PID, terminate it.
//   2. Remove the stale lock file.
//   3. If something else holds port 3000, terminate it too.
//
// Avoids the "Another next dev server is already running" failure that
// Next 16 raises when an old dev process is still bound to the port.

import { readFileSync, existsSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

const LOCK = ".next/dev/lock";
const PORT = Number(process.env.PORT ?? 3000);

// Sync sleep without spawning a subshell — Atomics.wait blocks the thread.
const SLEEP_BUF = new Int32Array(new SharedArrayBuffer(4));
function sleepSync(ms) {
  Atomics.wait(SLEEP_BUF, 0, 0, ms);
}

function isAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function terminate(pid, label) {
  if (!Number.isFinite(pid) || pid <= 1) return;
  if (!isAlive(pid)) return;
  console.log(`→ killing ${label} (pid ${pid})`);
  try {
    process.kill(pid, "SIGTERM");
  } catch {}
  // Brief grace period; then escalate.
  const deadline = Date.now() + 1500;
  while (Date.now() < deadline && isAlive(pid)) {
    sleepSync(100);
  }
  if (isAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {}
  }
}

// 1) Lock-file driven cleanup (canonical Next 16 signal).
if (existsSync(LOCK)) {
  let lockPid = null;
  try {
    const raw = readFileSync(LOCK, "utf8");
    const parsed = JSON.parse(raw);
    lockPid = Number(parsed?.pid);
  } catch {}
  if (lockPid) terminate(lockPid, "stale next dev");
  rmSync(LOCK, { force: true });
}

// 2) Port-driven fallback (covers cases where the lock was deleted but the
// process is still listening — e.g. a manual rm -rf .next).
try {
  const out = execSync(`lsof -ti tcp:${PORT}`, { stdio: ["ignore", "pipe", "ignore"] })
    .toString()
    .trim();
  if (out) {
    for (const pid of out.split(/\s+/).map(Number).filter(Boolean)) {
      terminate(pid, `process on port ${PORT}`);
    }
  }
} catch {
  // lsof exits non-zero when nothing is listening — that's fine.
}

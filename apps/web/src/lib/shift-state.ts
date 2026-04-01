// Server-side singleton: SSE client registry + claim/approval state.
// Module-level state persists for the lifetime of the Node.js process.
// Imported only from server.handlers — never bundled into the client.

import type { ShiftEvent } from "./types";

const sseClients = new Set<ReadableStreamDefaultController<Uint8Array>>();
const claimedShifts = new Set<string>();
const approvedShifts = new Set<string>();
const encoder = new TextEncoder();

let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

function formatSSE(event: ShiftEvent): Uint8Array {
  return encoder.encode(`data: ${JSON.stringify(event)}\n\n`);
}

export function broadcast(event: ShiftEvent) {
  const data = formatSSE(event);
  // Remove dead clients inline — avoids a separate cleanup pass
  const dead = new Set<ReadableStreamDefaultController<Uint8Array>>();
  for (const ctrl of sseClients) {
    try {
      ctrl.enqueue(data);
    } catch {
      dead.add(ctrl);
    }
  }
  for (const ctrl of dead) {
    sseClients.delete(ctrl);
  }
}

export function registerClient(
  ctrl: ReadableStreamDefaultController<Uint8Array>
) {
  sseClients.add(ctrl);
  if (!heartbeatTimer) {
    // Open Question #1 from design doc: heartbeat keeps SSE alive in envs
    // that close idle connections after ~10s (nginx, some proxies).
    heartbeatTimer = setInterval(() => {
      broadcast({ type: "heartbeat" });
    }, 5000);
  }
}

export function unregisterClient(
  ctrl: ReadableStreamDefaultController<Uint8Array>
) {
  sseClients.delete(ctrl);
  if (sseClients.size === 0 && heartbeatTimer !== null) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

// Returns true if the claim was successful, false if already claimed.
// Node.js single-threaded event loop makes has() → add() effectively atomic.
export function claimShift(shiftId: string): boolean {
  if (claimedShifts.has(shiftId)) {
    return false;
  }
  claimedShifts.add(shiftId);
  return true;
}

// Returns true if the approval was successful, false if shift not claimed yet.
export function approveShift(shiftId: string): boolean {
  if (!claimedShifts.has(shiftId)) {
    return false;
  }
  approvedShifts.add(shiftId);
  return true;
}

export function resetState() {
  claimedShifts.clear();
  approvedShifts.clear();
}

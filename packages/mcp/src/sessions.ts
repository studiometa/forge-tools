/**
 * Session manager for multi-tenant Streamable HTTP transport.
 *
 * Each MCP client session gets its own transport + server pair.
 * Sessions are identified by UUID and tracked in a Map.
 *
 * Supports automatic TTL-based cleanup of idle sessions to prevent
 * memory leaks from abandoned clients.
 */

import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

/**
 * A managed session: transport + MCP server pair.
 */
export interface ManagedSession {
  transport: StreamableHTTPServerTransport;
  server: Server;
  createdAt: number;
  lastActiveAt: number;
}

export interface SessionManagerOptions {
  /**
   * Maximum idle time in milliseconds before a session is reaped.
   * Default: 30 minutes. Set to 0 to disable automatic cleanup.
   */
  ttl?: number;

  /**
   * How often to check for expired sessions, in milliseconds.
   * Default: 60 seconds.
   */
  sweepInterval?: number;
}

const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
const DEFAULT_SWEEP_INTERVAL = 60 * 1000; // 60 seconds

export class SessionManager {
  private sessions = new Map<string, ManagedSession>();
  private sweepTimer: ReturnType<typeof setInterval> | undefined;
  private readonly ttl: number;

  constructor(options?: SessionManagerOptions) {
    this.ttl = options?.ttl ?? DEFAULT_TTL;

    if (this.ttl > 0) {
      const interval = options?.sweepInterval ?? DEFAULT_SWEEP_INTERVAL;
      this.sweepTimer = setInterval(() => {
        this.sweep();
      }, interval);
      // Don't keep the process alive just for the sweep timer
      this.sweepTimer.unref();
    }
  }

  /**
   * Register a session after its ID has been assigned by the transport.
   */
  register(transport: StreamableHTTPServerTransport, server: Server): void {
    const sessionId = transport.sessionId;
    if (sessionId) {
      const now = Date.now();
      this.sessions.set(sessionId, {
        transport,
        server,
        createdAt: now,
        lastActiveAt: now,
      });
    }
  }

  /**
   * Look up a session by its ID and refresh its activity timestamp.
   */
  get(sessionId: string): ManagedSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActiveAt = Date.now();
    }
    return session;
  }

  /**
   * Remove a session and close its transport + server.
   */
  async remove(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      this.sessions.delete(sessionId);
      await session.transport.close();
      await session.server.close();
    }
  }

  /**
   * Get the number of active sessions.
   */
  get size(): number {
    return this.sessions.size;
  }

  /**
   * Sweep expired sessions. Called automatically by the sweep timer.
   * Returns the number of sessions reaped.
   */
  sweep(): number {
    if (this.ttl <= 0) return 0;

    const now = Date.now();
    const expired: string[] = [];

    for (const [id, session] of this.sessions) {
      if (now - session.lastActiveAt > this.ttl) {
        expired.push(id);
      }
    }

    for (const id of expired) {
      // Fire-and-forget cleanup — don't block the sweep
      this.remove(id).catch(() => {});
    }

    return expired.length;
  }

  /**
   * Close all sessions, stop the sweep timer, and clean up.
   */
  async closeAll(): Promise<void> {
    if (this.sweepTimer) {
      clearInterval(this.sweepTimer);
      this.sweepTimer = undefined;
    }

    const promises: Promise<void>[] = [];
    for (const [, session] of this.sessions) {
      promises.push(session.transport.close());
      promises.push(session.server.close());
    }
    await Promise.all(promises);
    this.sessions.clear();
  }
}

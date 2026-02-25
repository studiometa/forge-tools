/**
 * Session manager for multi-tenant Streamable HTTP transport.
 *
 * Each MCP client session gets its own transport + server pair.
 * Sessions are identified by UUID and tracked in a Map.
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
}

export class SessionManager {
  private sessions = new Map<string, ManagedSession>();

  /**
   * Register a session after its ID has been assigned by the transport.
   */
  register(transport: StreamableHTTPServerTransport, server: Server): void {
    const sessionId = transport.sessionId;
    if (sessionId) {
      this.sessions.set(sessionId, {
        transport,
        server,
        createdAt: Date.now(),
      });
    }
  }

  /**
   * Look up a session by its ID.
   */
  get(sessionId: string): ManagedSession | undefined {
    return this.sessions.get(sessionId);
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
   * Close all sessions and clean up.
   */
  async closeAll(): Promise<void> {
    const promises: Promise<void>[] = [];
    for (const [, session] of this.sessions) {
      promises.push(session.transport.close());
      promises.push(session.server.close());
    }
    await Promise.all(promises);
    this.sessions.clear();
  }
}

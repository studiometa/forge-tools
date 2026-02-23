/**
 * Contextual hints for AI agents.
 *
 * After get/list actions, suggests related resources and common next steps
 * to help agents discover what's available.
 */

interface ResourceHint {
  resource: string;
  description: string;
  example: Record<string, unknown>;
}

export interface ContextualHints {
  related_resources?: ResourceHint[];
  common_actions?: { action: string; example: Record<string, unknown> }[];
}

/**
 * Hints after getting a server.
 */
export function getServerHints(serverId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "sites",
        description: "List sites on this server",
        example: { resource: "sites", action: "list", server_id: serverId },
      },
      {
        resource: "databases",
        description: "List databases",
        example: { resource: "databases", action: "list", server_id: serverId },
      },
      {
        resource: "daemons",
        description: "List background processes",
        example: { resource: "daemons", action: "list", server_id: serverId },
      },
      {
        resource: "firewall-rules",
        description: "List firewall rules",
        example: { resource: "firewall-rules", action: "list", server_id: serverId },
      },
    ],
    common_actions: [
      {
        action: "Reboot server",
        example: { resource: "servers", action: "reboot", id: serverId },
      },
    ],
  };
}

/**
 * Hints after getting a site.
 */
export function getSiteHints(serverId: string, siteId: string): ContextualHints {
  return {
    related_resources: [
      {
        resource: "deployments",
        description: "List deployments for this site",
        example: { resource: "deployments", action: "list", server_id: serverId, site_id: siteId },
      },
      {
        resource: "env",
        description: "Get environment variables",
        example: { resource: "env", action: "get", server_id: serverId, site_id: siteId },
      },
      {
        resource: "certificates",
        description: "List SSL certificates",
        example: { resource: "certificates", action: "list", server_id: serverId, site_id: siteId },
      },
      {
        resource: "nginx",
        description: "Get nginx configuration",
        example: { resource: "nginx", action: "get", server_id: serverId, site_id: siteId },
      },
    ],
    common_actions: [
      {
        action: "Deploy this site",
        example: {
          resource: "deployments",
          action: "deploy",
          server_id: serverId,
          site_id: siteId,
        },
      },
    ],
  };
}

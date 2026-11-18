/**
 * The bodies that the create actions send must match the requests of the Forge OpenAPI spec:
 * required fields with their defaults, and numbers where the spec takes numbers.
 */

import { describe, expect, it, vi } from "vitest";

import { mockDocument } from "@studiometa/forge-core";

import type { HandlerContext } from "./types.ts";

import { handleDaemons } from "./daemons.ts";
import { handleFirewallRules } from "./firewall-rules.ts";
import { handleMonitors } from "./monitors.ts";
import { handleScheduledJobs } from "./scheduled-jobs.ts";

function context(response?: unknown) {
  const post = vi.fn(async (_url: string, _body: unknown) => response);
  const ctx: HandlerContext = {
    executorContext: { organizationSlug: "o", client: { post } as never },
    compact: true,
  };
  return { ctx, post };
}

const monitor = mockDocument(2, "monitors", {
  type: "disk",
  operator: "gte",
  threshold: 90,
  minutes: 5,
  notify: "ops@example.com",
  status: "installed",
  state: "OK",
  state_changed_at: null,
  created_at: "2024",
  updated_at: "2024",
});

const job = mockDocument(3, "jobs", {
  name: null,
  command: "php artisan schedule:run",
  user: "forge",
  frequency: "custom",
  cron: "* * * * *",
  next_run_time: "2024",
  status: "installed",
  created_at: null,
  updated_at: null,
});

const daemon = mockDocument(4, "backgroundProcesses", {
  command: "php artisan queue:work",
  user: "forge",
  directory: null,
  processes: 1,
  status: "installing",
  created_at: "2024",
});

describe("create bodies", () => {
  it("monitors: sends numbers and notify", async () => {
    const { ctx, post } = context(monitor);
    await handleMonitors(
      "create",
      {
        resource: "monitors",
        action: "create",
        server_id: "1",
        type: "disk",
        operator: "gte",
        threshold: "90",
        minutes: 5,
        notify: "ops@example.com",
      },
      ctx,
    );
    expect(post.mock.calls[0][1]).toEqual({
      type: "disk",
      operator: "gte",
      threshold: 90,
      minutes: 5,
      notify: "ops@example.com",
    });
  });

  it("monitors: leaves out minutes when not given, and refuses an unknown type", async () => {
    const { ctx, post } = context(monitor);
    const args = { resource: "monitors", action: "create", server_id: "1", operator: "lte" };
    await handleMonitors(
      "create",
      { ...args, type: "cpu_load", threshold: 2, notify: "a@b.c" },
      ctx,
    );
    expect(post.mock.calls[0][1]).not.toHaveProperty("minutes");
    const result = await handleMonitors(
      "create",
      { ...args, type: "cpu", threshold: 2, notify: "a@b.c" },
      ctx,
    );
    expect(result.isError).toBe(true);
  });

  it("firewall-rules: sends the type, allow by default, and the port as a string", async () => {
    const { ctx, post } = context();
    await handleFirewallRules(
      "create",
      { resource: "firewall-rules", action: "create", server_id: "1", name: "HTTP", port: 80 },
      ctx,
    );
    expect(post.mock.calls[0][1]).toEqual({ name: "HTTP", type: "allow", port: "80" });

    await handleFirewallRules(
      "create",
      {
        resource: "firewall-rules",
        action: "create",
        server_id: "1",
        name: "Office",
        type: "deny",
        ip_address: "10.0.0.1",
      },
      ctx,
    );
    expect(post.mock.calls[1][1]).toEqual({ name: "Office", type: "deny", ip_address: "10.0.0.1" });
  });

  it("scheduled-jobs: sends forge and custom with a cron", async () => {
    const { ctx, post } = context(job);
    await handleScheduledJobs(
      "create",
      {
        resource: "scheduled-jobs",
        action: "create",
        server_id: "1",
        site_id: "2",
        command: "php artisan schedule:run",
        cron: "* * * * *",
        name: "Scheduler",
      },
      ctx,
    );
    expect(post.mock.calls[0][0]).toBe("/orgs/o/servers/1/sites/2/scheduled-jobs");
    expect(post.mock.calls[0][1]).toEqual({
      command: "php artisan schedule:run",
      user: "forge",
      frequency: "custom",
      cron: "* * * * *",
      name: "Scheduler",
    });
  });

  it("scheduled-jobs: sends nightly without frequency nor cron", async () => {
    const { ctx, post } = context(job);
    await handleScheduledJobs(
      "create",
      { resource: "scheduled-jobs", action: "create", server_id: "1", command: "x", user: "root" },
      ctx,
    );
    expect(post.mock.calls[0][1]).toEqual({ command: "x", user: "root", frequency: "nightly" });
  });

  it("daemons: sends a name, a user and processes", async () => {
    const { ctx, post } = context(daemon);
    await handleDaemons(
      "create",
      {
        resource: "daemons",
        action: "create",
        server_id: "1",
        command: "php artisan queue:work",
        directory: "/home/forge/app",
      },
      ctx,
    );
    expect(post.mock.calls[0][1]).toEqual({
      command: "php artisan queue:work",
      name: "php artisan queue:work",
      user: "forge",
      processes: 1,
      directory: "/home/forge/app",
    });

    await handleDaemons(
      "create",
      {
        resource: "daemons",
        action: "create",
        server_id: "1",
        command: "horizon",
        name: "Horizon",
        user: "root",
        processes: 2,
      },
      ctx,
    );
    expect(post.mock.calls[1][1]).toEqual({
      command: "horizon",
      name: "Horizon",
      user: "root",
      processes: 2,
    });
  });
});

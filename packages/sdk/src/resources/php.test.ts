import { describe, expect, it, vi } from "vitest";

import { Forge } from "../forge.ts";
import { createMockFetch } from "../test-utils.ts";

const ORG = "test-org";
const BASE = `https://forge.laravel.com/api/orgs/${ORG}/servers/123/php`;

function phpVersion(id: number, version: string) {
  return {
    id: String(id),
    type: "phpVersions",
    attributes: {
      version,
      binary_name: `php${version}`,
      status: "installed",
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z",
    },
  };
}

function setup(data: unknown = {}) {
  const fetch = createMockFetch(() => data);
  const php = new Forge("token", ORG, { fetch }).server(123).php;
  const call = (index = 0) => {
    const [url, init] = vi.mocked(fetch).mock.calls[index] as [string, RequestInit | undefined];
    return {
      url,
      method: init?.method ?? "GET",
      body: init?.body ? JSON.parse(init.body as string) : undefined,
    };
  };
  return { php, call };
}

describe("PhpResource", () => {
  it("should list PHP versions", async () => {
    const { php, call } = setup({
      data: [phpVersion(12, "8.3")],
      links: { next: null, prev: null },
      meta: { per_page: 30, next_cursor: null, prev_cursor: null },
    });

    const versions = await php.list();

    expect(call().url).toBe(`${BASE}/versions`);
    expect(versions).toEqual([expect.objectContaining({ id: 12, version: "8.3" })]);
  });

  it("should pass the cursor when listing PHP versions", async () => {
    const { php, call } = setup({
      data: [],
      links: { next: null, prev: null },
      meta: { per_page: 30, next_cursor: null, prev_cursor: null },
    });

    await php.list({ cursor: "abc" });

    expect(call().url).toBe(`${BASE}/versions?page[cursor]=abc`);
  });

  it("should get a PHP version", async () => {
    const { php, call } = setup({ data: phpVersion(12, "8.3") });

    const version = await php.get(12);

    expect(call().url).toBe(`${BASE}/versions/12`);
    expect(version).toMatchObject({ id: 12, binary_name: "php8.3" });
  });

  it("should get a configuration file", async () => {
    const { php, call } = setup({
      data: { id: "12", type: "phpConfigs", attributes: { configuration: "memory_limit = 512M" } },
    });

    const config = await php.config(12, "fpm");

    expect(call().url).toBe(`${BASE}/versions/12/configs/fpm`);
    expect(config).toBe("memory_limit = 512M");
  });

  it("should pass the pool user when getting a pool configuration", async () => {
    const { php, call } = setup({
      data: { id: "12", type: "phpConfigs", attributes: { configuration: "[www]" } },
    });

    await php.config(12, "pool", { user: "forge" });

    expect(call().url).toBe(`${BASE}/versions/12/configs/pool?user=forge`);
  });

  it("should update a configuration file", async () => {
    const { php, call } = setup();

    await php.updateConfig(12, "cli", "memory_limit = 1G");

    expect(call()).toEqual({
      url: `${BASE}/versions/12/configs/cli`,
      method: "PUT",
      body: { config: "memory_limit = 1G" },
    });
  });

  it("should send the pool user when updating a pool configuration", async () => {
    const { php, call } = setup();

    await php.updateConfig(12, "pool", "[www]", { user: "forge" });

    expect(call().body).toEqual({ config: "[www]", user: "forge" });
  });

  it("should get and set the max upload size", async () => {
    const { php, call } = setup({
      data: { id: "1", type: "phpSettings", attributes: { max_upload_size: 64 } },
    });

    expect(await php.maxUploadSize()).toBe("64");
    await php.setMaxUploadSize(128);

    expect(call(0).url).toBe(`${BASE}/max-upload-size`);
    expect(call(1)).toEqual({
      url: `${BASE}/max-upload-size`,
      method: "PUT",
      body: { max_upload_size: 128 },
    });
  });

  it("should get and set the max execution time", async () => {
    const { php, call } = setup({
      data: { id: "1", type: "phpSettings", attributes: { max_execution_time: "60" } },
    });

    expect(await php.maxExecutionTime()).toBe("60");
    await php.setMaxExecutionTime(120);

    expect(call(0).url).toBe(`${BASE}/max-execution-time`);
    expect(call(1)).toEqual({
      url: `${BASE}/max-execution-time`,
      method: "PUT",
      body: { max_execution_time: 120 },
    });
  });

  it("should get, enable and disable OPcache", async () => {
    const { php, call } = setup({
      data: { id: "1", type: "phpOpcache", attributes: { opcache_enabled: false } },
    });

    expect(await php.opcache()).toBe(false);
    await php.enableOpcache();
    await php.disableOpcache();

    expect(call(0).url).toBe(`${BASE}/opcache`);
    expect(call(1)).toMatchObject({ url: `${BASE}/opcache`, method: "POST" });
    expect(call(2)).toMatchObject({ url: `${BASE}/opcache`, method: "DELETE" });
  });
});

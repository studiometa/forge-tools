import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { mockDocument } from "../../test-helpers.ts";
import {
  getPhpMaxExecutionTime,
  getPhpMaxUploadSize,
  updatePhpMaxExecutionTime,
  updatePhpMaxUploadSize,
} from "./limits.ts";

describe("getPhpMaxUploadSize", () => {
  it("should get the max upload size as a string", async () => {
    const getMock = vi.fn(async () => mockDocument(1, "phpSettings", { max_upload_size: 64 }));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getPhpMaxUploadSize({ server_id: "1" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/max-upload-size");
    expect(result.data).toBe("64");
  });
});

describe("updatePhpMaxUploadSize", () => {
  it("should send max_upload_size", async () => {
    const putMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    const result = await updatePhpMaxUploadSize({ server_id: "1", size: 128 }, ctx);

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/max-upload-size", {
      max_upload_size: 128,
    });
    expect(result.data).toBeUndefined();
  });
});

describe("getPhpMaxExecutionTime", () => {
  it("should get the max execution time as a string", async () => {
    const getMock = vi.fn(async () => mockDocument(1, "phpSettings", { max_execution_time: "60" }));
    const ctx = createTestExecutorContext({
      client: { get: getMock } as never,
      organizationSlug: "test-org",
    });

    const result = await getPhpMaxExecutionTime({ server_id: "1" }, ctx);

    expect(getMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/max-execution-time");
    expect(result.data).toBe("60");
  });
});

describe("updatePhpMaxExecutionTime", () => {
  it("should send max_execution_time", async () => {
    const putMock = vi.fn(async () => {});
    const ctx = createTestExecutorContext({
      client: { put: putMock } as never,
      organizationSlug: "test-org",
    });

    const result = await updatePhpMaxExecutionTime({ server_id: "1", seconds: 120 }, ctx);

    expect(putMock).toHaveBeenCalledWith("/orgs/test-org/servers/1/php/max-execution-time", {
      max_execution_time: 120,
    });
    expect(result.data).toBeUndefined();
  });
});

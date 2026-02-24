import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createContext, createTestContext } from "./context.ts";
import { OutputFormatter } from "./output.ts";
import { ConfigError } from "./errors.ts";

vi.mock("./config.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./config.ts")>();
  return {
    ...actual,
    createConfigStore: vi.fn().mockReturnValue({}),
    getToken: vi.fn().mockReturnValue(null),
    setToken: vi.fn(),
    deleteToken: vi.fn(),
  };
});

vi.mock("@studiometa/forge-api", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@studiometa/forge-api")>();
  return {
    ...actual,
    HttpClient: vi.fn().mockImplementation(function (this: Record<string, unknown>) {
      this.get = vi.fn();
      this.post = vi.fn();
      this.put = vi.fn();
      this.delete = vi.fn();
    }),
    createConfigStore: vi.fn().mockReturnValue({}),
    getToken: vi.fn().mockReturnValue(null),
  };
});

describe("createContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create context with defaults", () => {
    const ctx = createContext({});
    expect(ctx.formatter).toBeInstanceOf(OutputFormatter);
    expect(ctx.options).toEqual({});
  });

  it("should use format option for formatter", () => {
    const ctx = createContext({ format: "json" });
    expect(ctx.formatter).toBeInstanceOf(OutputFormatter);
  });

  it("should use f short option for format", () => {
    const ctx = createContext({ f: "table" });
    expect(ctx.formatter).toBeInstanceOf(OutputFormatter);
  });

  it("should default to human format", () => {
    const ctx = createContext({});
    expect(ctx.formatter).toBeInstanceOf(OutputFormatter);
  });

  describe("getToken", () => {
    it("should return CLI token when provided", () => {
      const ctx = createContext({ token: "cli-token" });
      expect(ctx.getToken()).toBe("cli-token");
    });

    it("should return stored token when no CLI token", async () => {
      const { getToken } = await import("./config.ts");
      vi.mocked(getToken).mockReturnValue("stored-token");

      const ctx = createContext({});
      expect(ctx.getToken()).toBe("stored-token");
    });

    it("should throw ConfigError when no token available", async () => {
      const { getToken } = await import("./config.ts");
      vi.mocked(getToken).mockReturnValue(null);

      const ctx = createContext({});
      expect(() => ctx.getToken()).toThrow(ConfigError);
    });

    it("should ignore empty string token", async () => {
      const { getToken } = await import("./config.ts");
      vi.mocked(getToken).mockReturnValue("fallback-token");

      const ctx = createContext({ token: "" });
      expect(ctx.getToken()).toBe("fallback-token");
    });
  });

  describe("createExecutorContext", () => {
    it("should create executor context with HttpClient", () => {
      const ctx = createContext({ token: "my-token" });
      const execCtx = ctx.createExecutorContext("my-token");
      expect(execCtx.client).toBeDefined();
    });
  });
});

describe("createTestContext", () => {
  it("should create context with default test values", () => {
    const ctx = createTestContext({});
    expect(ctx.formatter).toBeInstanceOf(OutputFormatter);
    expect(ctx.options.format).toBe("json");
    expect(ctx.options["no-color"]).toBe(true);
  });

  it("should return test-token by default", () => {
    const ctx = createTestContext({});
    expect(ctx.getToken()).toBe("test-token");
  });

  it("should return provided token", () => {
    const ctx = createTestContext({ token: "my-test-token" });
    expect(ctx.getToken()).toBe("my-test-token");
  });

  it("should return token from options", () => {
    const ctx = createTestContext({ options: { token: "opts-token" } });
    expect(ctx.getToken()).toBe("opts-token");
  });

  it("should allow overriding formatter", () => {
    const customFormatter = new OutputFormatter("json", true);
    const ctx = createTestContext({ formatter: customFormatter });
    expect(ctx.formatter).toBe(customFormatter);
  });

  it("should throw when createExecutorContext called without mockClient", () => {
    const ctx = createTestContext({});
    expect(() => ctx.createExecutorContext("token")).toThrow("provide mockClient");
  });

  it("should return mockClient in createExecutorContext when provided", () => {
    const mockClient = { get: vi.fn() } as never;
    const ctx = createTestContext({ mockClient });
    const execCtx = ctx.createExecutorContext("token");
    expect(execCtx.client).toBe(mockClient);
  });
});

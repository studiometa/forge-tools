import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import type { ForgeNginxTemplate } from "@studiometa/forge-api";

import { createTestContext } from "../../context.ts";
import {
  nginxTemplatesList,
  nginxTemplatesGet,
  nginxTemplatesCreate,
  nginxTemplatesUpdate,
  nginxTemplatesDelete,
} from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listNginxTemplates: vi.fn(),
  getNginxTemplate: vi.fn(),
  createNginxTemplate: vi.fn(),
  updateNginxTemplate: vi.fn(),
  deleteNginxTemplate: vi.fn(),
}));

const mockTemplate: ForgeNginxTemplate = {
  id: 1,
  server_id: 10,
  name: "my-template",
  content: "server { }",
  created_at: "2024-01-01T00:00:00Z",
};

describe("nginxTemplatesList", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should list nginx templates", async () => {
    const { listNginxTemplates } = await import("@studiometa/forge-core");
    vi.mocked(listNginxTemplates).mockResolvedValue({ data: [mockTemplate] });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesList(ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"my-template"'));
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await nginxTemplatesList(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("nginxTemplatesGet", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should get nginx template by id", async () => {
    const { getNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(getNginxTemplate).mockResolvedValue({ data: mockTemplate });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesGet(["1"], ctx);
    expect(vi.mocked(console.log)).toHaveBeenCalledWith(expect.stringContaining('"my-template"'));
  });

  it("should exit with error when no template_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesGet([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await nginxTemplatesGet(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("nginxTemplatesCreate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should create an nginx template", async () => {
    const { createNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(createNginxTemplate).mockResolvedValue({ data: mockTemplate });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "my-template", content: "server { }" },
    });

    await nginxTemplatesCreate(ctx);
    expect(vi.mocked(createNginxTemplate)).toHaveBeenCalledWith(
      expect.objectContaining({ name: "my-template", content: "server { }" }),
      expect.anything(),
    );
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", name: "my-template", content: "server { }" },
    });

    await nginxTemplatesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no name", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", content: "server { }" },
    });

    await nginxTemplatesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no content", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "my-template" },
    });

    await nginxTemplatesCreate(ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("nginxTemplatesUpdate", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should update an nginx template", async () => {
    const { updateNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(updateNginxTemplate).mockResolvedValue({ data: mockTemplate });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", name: "new-name" },
    });

    await nginxTemplatesUpdate(["1"], ctx);
    expect(vi.mocked(updateNginxTemplate)).toHaveBeenCalledWith(
      expect.objectContaining({ server_id: "10", id: "1", name: "new-name" }),
      expect.anything(),
    );
  });

  it("should update with content only", async () => {
    const { updateNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(updateNginxTemplate).mockResolvedValue({ data: mockTemplate });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10", content: "server { listen 80; }" },
    });

    await nginxTemplatesUpdate(["1"], ctx);
    expect(vi.mocked(updateNginxTemplate)).toHaveBeenCalledWith(
      expect.objectContaining({ content: "server { listen 80; }" }),
      expect.anything(),
    );
  });

  it("should update with no optional fields", async () => {
    const { updateNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(updateNginxTemplate).mockResolvedValue({ data: mockTemplate });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesUpdate(["1"], ctx);
    expect(vi.mocked(updateNginxTemplate)).toHaveBeenCalledWith(
      expect.objectContaining({ name: undefined, content: undefined }),
      expect.anything(),
    );
  });

  it("should exit with error when no template_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesUpdate([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await nginxTemplatesUpdate(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

describe("nginxTemplatesDelete", () => {
  let processExitSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    processExitSpy = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should delete an nginx template", async () => {
    const { deleteNginxTemplate } = await import("@studiometa/forge-core");
    vi.mocked(deleteNginxTemplate).mockResolvedValue({ data: undefined });

    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesDelete(["1"], ctx);
    expect(vi.mocked(deleteNginxTemplate)).toHaveBeenCalledWith(
      { server_id: "10", id: "1" },
      expect.anything(),
    );
  });

  it("should exit with error when no template_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json", server: "10" },
    });

    await nginxTemplatesDelete([], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });

  it("should exit with error when no server_id", async () => {
    const ctx = createTestContext({
      token: "test",
      mockClient: {} as never,
      options: { format: "json" },
    });

    await nginxTemplatesDelete(["1"], ctx).catch(() => {});
    expect(processExitSpy).toHaveBeenCalledWith(3);
  });
});

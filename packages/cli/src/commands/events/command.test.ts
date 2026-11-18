import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { handleEventsCommand } from "./command.ts";

vi.mock("./handlers.ts", () => ({
  eventsList: vi.fn().mockResolvedValue(),
  eventsGet: vi.fn().mockResolvedValue(),
  eventsOutput: vi.fn().mockResolvedValue(),
}));

describe("handleEventsCommand routing", () => {
  beforeEach(() => {
    vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should route list, ls, get and output", async () => {
    const h = await import("./handlers.ts");
    await handleEventsCommand("list", [], {});
    await handleEventsCommand("ls", [], {});
    await handleEventsCommand("get", ["5"], { server: "1" });
    await handleEventsCommand("output", ["5"], { server: "1" });
    expect(h.eventsList).toHaveBeenCalledTimes(2);
    expect(h.eventsGet).toHaveBeenCalledWith(["5"], expect.anything());
    expect(h.eventsOutput).toHaveBeenCalledWith(["5"], expect.anything());
  });
});

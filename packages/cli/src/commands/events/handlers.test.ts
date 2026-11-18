import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { createTestContext } from "../../context.ts";
import { eventsGet, eventsList, eventsOutput } from "./handlers.ts";

vi.mock("@studiometa/forge-core", () => ({
  listEvents: vi.fn(),
  getEvent: vi.fn(),
  getEventOutput: vi.fn(),
}));

const event = {
  id: 5,
  description: "Adding database",
  ran_as: "forge",
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
};

function context(options: Record<string, unknown>) {
  return createTestContext({ token: "test", mockClient: {} as never, options });
}

let exit: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  exit = vi.spyOn(process, "exit").mockImplementation(() => undefined as never);
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("eventsList", () => {
  it("should list the events of the organization", async () => {
    const { listEvents } = await import("@studiometa/forge-core");
    vi.mocked(listEvents).mockResolvedValue({ data: [event] });

    await eventsList(context({ format: "human" }));

    expect(listEvents).toHaveBeenLastCalledWith({}, expect.anything());
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining("Adding database"));
  });

  it("should list the events of a server with filters", async () => {
    const { listEvents } = await import("@studiometa/forge-core");
    vi.mocked(listEvents).mockResolvedValue({ data: [] });

    await eventsList(
      context({ format: "json", server: "1", "initiated-by": "3", "ran-as": "root" }),
    );

    expect(listEvents).toHaveBeenLastCalledWith(
      { server_id: "1", initiated_by: "3", ran_as: "root" },
      expect.anything(),
    );
  });
});

describe("eventsGet", () => {
  it("should get an event", async () => {
    const { getEvent } = await import("@studiometa/forge-core");
    vi.mocked(getEvent).mockResolvedValue({ data: event });

    await eventsGet(["5"], context({ format: "json", server: "1" }));

    expect(getEvent).toHaveBeenCalledWith({ server_id: "1", id: "5" }, expect.anything());
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('"Adding database"'));
  });

  it("should require the event ID and the server", async () => {
    await eventsGet([], context({ format: "json", server: "1" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
    exit.mockClear();
    await eventsGet(["5"], context({ format: "json" })).catch(() => {});
    expect(exit).toHaveBeenCalledWith(3);
  });
});

describe("eventsOutput", () => {
  it("should print the output", async () => {
    const { getEventOutput } = await import("@studiometa/forge-core");
    vi.mocked(getEventOutput).mockResolvedValue({ data: "Done." });
    const write = vi.spyOn(process.stdout, "write").mockImplementation(() => true);

    await eventsOutput(["5"], context({ format: "human", server: "1" }));

    expect(write).toHaveBeenCalledWith("Done.\n");
  });

  it("should output JSON", async () => {
    const { getEventOutput } = await import("@studiometa/forge-core");
    vi.mocked(getEventOutput).mockResolvedValue({ data: "Done." });

    await eventsOutput(["5"], context({ format: "json", server: "1" }));

    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ output: "Done." }));
  });
});

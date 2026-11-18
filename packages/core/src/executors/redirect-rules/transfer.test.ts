import { describe, expect, it, vi } from "vitest";

import { createTestExecutorContext } from "../../context.ts";
import { exportRedirectRules } from "./export.ts";
import { importRedirectRules } from "./import.ts";
import { reorderRedirectRules } from "./reorder.ts";

const site = { server_id: "1", site_id: "2" };

describe("exportRedirectRules", () => {
  it("should return the CSV of the redirect rules", async () => {
    const get = vi.fn(async () => "from,to,type\n/a,/b,redirect\n");
    const ctx = createTestExecutorContext({ client: { get } as never, organizationSlug: "o" });

    const result = await exportRedirectRules(site, ctx);

    expect(get).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/redirect-rules/export");
    expect(result.data).toBe("from,to,type\n/a,/b,redirect\n");
  });
});

describe("importRedirectRules", () => {
  it("should send the CSV as a file with the mode", async () => {
    const post = vi.fn(async (_url: string, _body: FormData) => ({ imported: 1 }));
    const ctx = createTestExecutorContext({ client: { post } as never, organizationSlug: "o" });

    const result = await importRedirectRules(
      { ...site, csv: "from,to,type\n/a,/b,redirect\n", mode: "replace" },
      ctx,
    );

    const [url, form] = post.mock.calls[0];
    expect(url).toBe("/orgs/o/servers/1/sites/2/redirect-rules/import");
    expect(form.get("mode")).toBe("replace");
    const file = form.get("file") as File;
    expect(file.name).toBe("redirects.csv");
    expect(await file.text()).toBe("from,to,type\n/a,/b,redirect\n");
    expect(result.data).toEqual({ imported: 1 });
  });
});

describe("reorderRedirectRules", () => {
  it("should send the rule IDs in order", async () => {
    const put = vi.fn(async () => {});
    const ctx = createTestExecutorContext({ client: { put } as never, organizationSlug: "o" });

    const result = await reorderRedirectRules({ ...site, redirects: [3, 1, 2] }, ctx);

    expect(put).toHaveBeenCalledWith("/orgs/o/servers/1/sites/2/redirect-rules/reorder", {
      redirects: [3, 1, 2],
    });
    expect(result.data).toBeUndefined();
  });
});

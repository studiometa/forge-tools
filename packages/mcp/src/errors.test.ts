import { describe, expect, it } from "vitest";

import { ErrorMessages, UserInputError, isUserInputError } from "./errors.ts";

describe("UserInputError", () => {
  it("should create error with message only", () => {
    const error = new UserInputError("Something went wrong");
    expect(error.name).toBe("UserInputError");
    expect(error.message).toBe("Something went wrong");
    expect(error.hints).toBeUndefined();
  });

  it("should create error with hints", () => {
    const error = new UserInputError("Missing field", ["Provide the field", "Check documentation"]);
    expect(error.hints).toEqual(["Provide the field", "Check documentation"]);
  });

  it("should be an instance of Error", () => {
    const error = new UserInputError("test");
    expect(error instanceof Error).toBe(true);
  });

  it("should format message without hints", () => {
    const error = new UserInputError("Simple error");
    expect(error.toFormattedMessage()).toMatchInlineSnapshot(`"**Input Error:** Simple error"`);
  });

  it("should format message with hints", () => {
    const error = new UserInputError("Complex error", ["Hint 1", "Hint 2"]);
    expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
      "**Input Error:** Complex error

      **Hints:**
      - Hint 1
      - Hint 2"
    `);
  });

  it("should format message with empty hints array", () => {
    const error = new UserInputError("No hints", []);
    expect(error.toFormattedMessage()).toBe("**Input Error:** No hints");
  });
});

describe("isUserInputError", () => {
  it("should return true for UserInputError", () => {
    expect(isUserInputError(new UserInputError("test"))).toBe(true);
  });

  it("should return false for regular Error", () => {
    expect(isUserInputError(new Error("test"))).toBe(false);
  });

  it("should return false for non-error values", () => {
    expect(isUserInputError("string")).toBe(false);
    expect(isUserInputError(null)).toBe(false);
    expect(isUserInputError(undefined)).toBe(false);
  });
});

describe("ErrorMessages", () => {
  describe("missingId", () => {
    it("should format get action error", () => {
      const error = ErrorMessages.missingId("get");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** id is required for get action

        **Hints:**
        - Use action="list" first to find the resource ID
        - Then use action="get" with the id parameter"
      `);
    });

    it("should format update action error", () => {
      const error = ErrorMessages.missingId("update");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** id is required for update action

        **Hints:**
        - Use action="list" first to find the resource ID
        - Then use action="update" with the id parameter"
      `);
    });
  });

  describe("missingRequiredFields", () => {
    it("should format single field error", () => {
      const error = ErrorMessages.missingRequiredFields("site", ["name"]);
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** name is required for creating site

        **Hints:**
        - Provide all required fields: name
        - Use action="help" for detailed documentation on site"
      `);
    });

    it("should format multiple fields error", () => {
      const error = ErrorMessages.missingRequiredFields("database", ["name", "type"]);
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** name, type are required for creating database

        **Hints:**
        - Provide all required fields: name, type
        - Use action="help" for detailed documentation on database"
      `);
    });
  });

  describe("invalidAction", () => {
    it("should format invalid action error", () => {
      const error = ErrorMessages.invalidAction("delete", "servers", ["list", "get"]);
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** Invalid action "delete" for servers

        **Hints:**
        - Valid actions are: list, get
        - Use action="help" with resource="servers" for detailed documentation"
      `);
    });
  });

  describe("unknownResource", () => {
    it("should format unknown resource error", () => {
      const error = ErrorMessages.unknownResource("widgets", ["servers", "sites"]);
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** Unknown resource: widgets

        **Hints:**
        - Valid resources are: servers, sites
        - Use action="help" without a resource for an overview of all resources"
      `);
    });
  });

  describe("noUpdateFieldsSpecified", () => {
    it("should format no update fields error", () => {
      const error = ErrorMessages.noUpdateFieldsSpecified(["name", "status"]);
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** No updates specified. Provide at least one of: name, status

        **Hints:**
        - Specify at least one field to update
        - Updatable fields are: name, status"
      `);
    });
  });

  describe("apiError", () => {
    it("should format 401 error with hints", () => {
      const error = ErrorMessages.apiError(401, "Unauthorized");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** API error (401): Unauthorized

        **Hints:**
        - Check that your API token is valid and not expired"
      `);
    });

    it("should format 403 error with hints", () => {
      const error = ErrorMessages.apiError(403, "Forbidden");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** API error (403): Forbidden

        **Hints:**
        - You may not have permission to access this resource
        - Check your API token permissions"
      `);
    });

    it("should format 404 error with hints", () => {
      const error = ErrorMessages.apiError(404, "Not Found");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** API error (404): Not Found

        **Hints:**
        - The resource may not exist or you may not have access
        - Verify the resource ID is correct
        - Use action="list" to find valid resource IDs"
      `);
    });

    it("should format 422 error with hints", () => {
      const error = ErrorMessages.apiError(422, "Validation failed");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** API error (422): Validation failed

        **Hints:**
        - The request data may be invalid
        - Check the field values and types
        - Use action="help" for field documentation"
      `);
    });

    it("should format 500 error with hints", () => {
      const error = ErrorMessages.apiError(500, "Internal Server Error");
      expect(error.toFormattedMessage()).toMatchInlineSnapshot(`
        "**Input Error:** API error (500): Internal Server Error

        **Hints:**
        - This is a server error - try again later"
      `);
    });

    it("should format 200 error with no hints", () => {
      const error = ErrorMessages.apiError(200, "Unexpected");
      expect(error.hints).toEqual([]);
      expect(error.toFormattedMessage()).toBe("**Input Error:** API error (200): Unexpected");
    });
  });
});

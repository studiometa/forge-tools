/**
 * Custom error classes for MCP server
 *
 * These provide structured error handling with LLM-friendly messages
 * that include guidance on how to resolve issues.
 */

/**
 * Error thrown when user input validation fails.
 * These errors should be returned to the user directly.
 *
 * Includes optional hints for how to resolve the issue.
 */
export class UserInputError extends Error {
  public readonly hints?: string[];

  constructor(message: string, hints?: string[]) {
    super(message);
    this.name = "UserInputError";
    this.hints = hints;
  }

  /**
   * Format error message with hints for LLM consumption
   */
  toFormattedMessage(): string {
    let msg = `**Input Error:** ${this.message}`;
    if (this.hints && this.hints.length > 0) {
      msg += "\n\n**Hints:**\n" + this.hints.map((h) => `- ${h}`).join("\n");
    }
    return msg;
  }
}

/**
 * Error messages with guidance for common validation failures
 */
export const ErrorMessages = {
  // Required field errors
  missingId: (action: string) =>
    new UserInputError(`id is required for ${action} action`, [
      `Use action="list" first to find the resource ID`,
      `Then use action="${action}" with the id parameter`,
    ]),

  missingRequiredFields: (resource: string, fields: string[]) =>
    new UserInputError(
      `${fields.join(", ")} ${fields.length === 1 ? "is" : "are"} required for creating ${resource}`,
      [
        `Provide all required fields: ${fields.join(", ")}`,
        `Use action="help" for detailed documentation on ${resource}`,
      ],
    ),

  // Invalid action errors
  invalidAction: (action: string, resource: string, validActions: string[]) =>
    new UserInputError(`Invalid action "${action}" for ${resource}`, [
      `Valid actions are: ${validActions.join(", ")}`,
      `Use action="help" with resource="${resource}" for detailed documentation`,
    ]),

  // Unknown resource errors
  unknownResource: (resource: string, validResources: string[]) =>
    new UserInputError(`Unknown resource: ${resource}`, [
      `Valid resources are: ${validResources.join(", ")}`,
      `Use action="help" without a resource for an overview of all resources`,
    ]),

  // Update-specific errors
  noUpdateFieldsSpecified: (allowedFields: string[]) =>
    new UserInputError(
      `No updates specified. Provide at least one of: ${allowedFields.join(", ")}`,
      ["Specify at least one field to update", `Updatable fields are: ${allowedFields.join(", ")}`],
    ),

  // API errors
  apiError: (statusCode: number, message: string) => {
    const hints: string[] = [];

    if (statusCode === 401) {
      hints.push("Check that your API token is valid and not expired");
    } else if (statusCode === 403) {
      hints.push("You may not have permission to access this resource");
      hints.push("Check your API token permissions");
    } else if (statusCode === 404) {
      hints.push("The resource may not exist or you may not have access");
      hints.push("Verify the resource ID is correct");
      hints.push('Use action="list" to find valid resource IDs');
    } else if (statusCode === 422) {
      hints.push("The request data may be invalid");
      hints.push("Check the field values and types");
      hints.push('Use action="help" for field documentation');
    } else if (statusCode >= 500) {
      hints.push("This is a server error - try again later");
    }

    return new UserInputError(`API error (${statusCode}): ${message}`, hints);
  },
} as const;

/**
 * Check if an error is a UserInputError
 */
export function isUserInputError(error: unknown): error is UserInputError {
  return error instanceof UserInputError;
}

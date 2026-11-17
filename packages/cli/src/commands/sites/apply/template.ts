/**
 * Template variables of a site file: `{{NAME}}` or `{{ NAME }}`, rendered locally. The Nginx file
 * and the commands of workers and scheduled jobs use them, each with its own variables.
 */

import { ValidationError } from "../../../errors.ts";

/** A variable: the name between double braces. Spaces inside the braces are allowed. */
const VARIABLE = /\{\{\s*([^{}]*?)\s*\}\}/g;

/** The names of the variables in a template, each once, in order. */
export function templateVariables(template: string): string[] {
  return [...new Set([...template.matchAll(VARIABLE)].map((match) => match[1]))];
}

/**
 * Exit with a validation error when the template has a variable that is not in `variables`.
 * `subject` names the template in the message, e.g. `Nginx file nginx.conf`.
 */
export function assertTemplate(
  template: string,
  variables: readonly string[],
  subject: string,
  field: string,
): void {
  const known: ReadonlySet<string> = new Set(variables);
  const unknown = templateVariables(template).filter((name) => !known.has(name));
  if (unknown.length > 0) {
    throw new ValidationError(
      `${subject} has unknown variables: ${unknown.map((name) => `{{${name}}}`).join(", ")}`,
      field,
      [`Supported variables: ${variables.map((name) => `{{${name}}}`).join(", ")}`],
    );
  }
}

/**
 * Replace each variable of the template with its value, and keep the rest of the text as it is.
 * A value is read only when the template uses it, so a getter can refuse a value it cannot know.
 */
export function renderTemplate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replaceAll(VARIABLE, (match, name: string) =>
    name in values ? values[name] : match,
  );
}

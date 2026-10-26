/**
 * Print file content fetched from Forge, such as a configuration or a script.
 */

/**
 * Write the content as it is, with a newline only when it does not end with one,
 * so `forge <command> get > file` round-trips with `--file file --check` without drift.
 */
export function printContent(content: string): void {
  process.stdout.write(content.endsWith("\n") ? content : `${content}\n`);
}

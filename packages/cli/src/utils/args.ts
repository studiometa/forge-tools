/**
 * Simple argument parser using native Node.js.
 * Parses process.argv into a structured format with no external deps.
 */

export type OptionValue = string | boolean | string[];
export type CommandOptions = Record<string, OptionValue>;

export interface ParsedArgs {
  command: string[];
  options: Record<string, OptionValue>;
  positional: string[];
}

/**
 * Whether an argument can be the value of the option before it.
 * A lone "-" is a value (it means stdin), other "-" prefixed arguments are options.
 */
function isOptionValue(arg: string): boolean {
  return arg === "-" || !arg.startsWith("-");
}

/**
 * Set an option value. A string option given more than once collects its values
 * into an array (`--server 1 --server 2` → `["1", "2"]`); flags keep the last value.
 */
function setOption(
  options: Record<string, OptionValue>,
  key: string,
  value: string | boolean,
): void {
  const previous = options[key];
  if (typeof value === "string" && previous !== undefined && typeof previous !== "boolean") {
    options[key] = [previous, value].flat();
  } else {
    options[key] = value;
  }
}

export function parseArgs(argv: string[] = process.argv.slice(2)): ParsedArgs {
  const options: Record<string, OptionValue> = {};
  const positional: string[] = [];
  const command: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith("--")) {
      // Long option: --key=value or --key value or --flag
      const equalIndex = arg.indexOf("=");
      if (equalIndex > -1) {
        const key = arg.slice(2, equalIndex);
        const value = arg.slice(equalIndex + 1);
        setOption(options, key, value);
      } else {
        const key = arg.slice(2);
        const nextArg = argv[i + 1];

        if (nextArg !== undefined && isOptionValue(nextArg)) {
          setOption(options, key, nextArg);
          i++;
        } else {
          setOption(options, key, true);
        }
      }
    } else if (arg.startsWith("-") && arg.length > 1) {
      // Short option: -k value or -abc (multiple flags)
      if (arg.length === 2) {
        const key = arg[1];
        const nextArg = argv[i + 1];

        if (nextArg !== undefined && isOptionValue(nextArg)) {
          setOption(options, key, nextArg);
          i++;
        } else {
          setOption(options, key, true);
        }
      } else {
        // Multiple short flags: -abc -> -a -b -c
        for (let j = 1; j < arg.length; j++) {
          options[arg[j]] = true;
        }
      }
    } else {
      // Positional argument or command
      // First two non-option args are command and subcommand
      if (command.length < 2) {
        command.push(arg);
      } else {
        positional.push(arg);
      }
    }
  }

  return { command, options, positional };
}

export function getOption(
  options: Record<string, OptionValue>,
  names: string[],
  defaultValue?: string,
): string | undefined {
  for (const name of names) {
    if (name in options) {
      const value = options[name];
      return typeof value === "string" ? value : undefined;
    }
  }
  return defaultValue;
}

export function hasFlag(options: Record<string, OptionValue>, names: string[]): boolean {
  return names.some((name) => options[name] === true);
}

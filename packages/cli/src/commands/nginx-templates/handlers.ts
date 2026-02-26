import {
  createNginxTemplate,
  deleteNginxTemplate,
  getNginxTemplate,
  listNginxTemplates,
  updateNginxTemplate,
} from "@studiometa/forge-core";

import type { CommandContext } from "../../context.ts";

import { exitWithValidationError, runCommand } from "../../error-handler.ts";
import { resolveServerId } from "../../utils/resolve.ts";

export async function nginxTemplatesList(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx-templates list --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await listNginxTemplates({ server_id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function nginxTemplatesGet(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "template_id",
      "forge-cli nginx-templates get <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx-templates get <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await getNginxTemplate({ server_id, id }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function nginxTemplatesCreate(ctx: CommandContext): Promise<void> {
  const server = String(ctx.options.server ?? "");
  const name = String(ctx.options.name ?? "");
  const content = String(ctx.options.content ?? "");

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx-templates create --server <server_id> --name <name> --content <content>",
      ctx.formatter,
    );
  }

  if (!name) {
    exitWithValidationError(
      "name",
      "forge-cli nginx-templates create --server <server_id> --name <name> --content <content>",
      ctx.formatter,
    );
  }

  if (!content) {
    exitWithValidationError(
      "content",
      "forge-cli nginx-templates create --server <server_id> --name <name> --content <content>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const result = await createNginxTemplate({ server_id, name, content }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function nginxTemplatesUpdate(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "template_id",
      "forge-cli nginx-templates update <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx-templates update <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    const name = ctx.options.name ? String(ctx.options.name) : undefined;
    const content = ctx.options.content ? String(ctx.options.content) : undefined;
    const result = await updateNginxTemplate({ server_id, id, name, content }, execCtx);
    ctx.formatter.output(result.data);
  }, ctx.formatter);
}

export async function nginxTemplatesDelete(args: string[], ctx: CommandContext): Promise<void> {
  const [id] = args;
  const server = String(ctx.options.server ?? "");

  if (!id) {
    exitWithValidationError(
      "template_id",
      "forge-cli nginx-templates delete <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  if (!server) {
    exitWithValidationError(
      "server_id",
      "forge-cli nginx-templates delete <template_id> --server <server_id>",
      ctx.formatter,
    );
  }

  await runCommand(async () => {
    const token = ctx.getToken();
    const execCtx = ctx.createExecutorContext(token);
    const server_id = await resolveServerId(server, execCtx);
    await deleteNginxTemplate({ server_id, id }, execCtx);
    ctx.formatter.success(`Nginx template ${id} deleted.`);
  }, ctx.formatter);
}

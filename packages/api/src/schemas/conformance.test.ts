/**
 * Compare the Valibot schemas with the Forge OpenAPI spec, so that a change of the spec
 * (a new field, a field that becomes nullable, a new enum value) fails here.
 *
 * - Attributes: each field of the spec resource is in the schema, with the same types; a
 *   nullable field of the spec is nullable in the schema. A field that the spec requires can be
 *   optional in the schema: a missing field must not fail a whole response.
 * - Requests: each field of the spec request is in the schema, with types that the spec accepts;
 *   a field that the spec requires is required in the schema.
 */

import { describe, expect, it } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

import * as attributes from "./attributes.ts";
import * as types from "./types.ts";

interface SpecSchema {
  $ref?: string;
  type?: string | string[];
  enum?: unknown[];
  anyOf?: SpecSchema[];
  oneOf?: SpecSchema[];
  allOf?: SpecSchema[];
  properties?: Record<string, SpecSchema>;
  required?: string[];
  items?: SpecSchema;
}

interface ValibotNode {
  type: string;
  wrapped?: ValibotNode;
  options?: ValibotNode[] | unknown[];
  entries?: Record<string, ValibotNode>;
}

const spec = JSON.parse(
  fs.readFileSync(
    path.resolve(import.meta.dirname, "../../../../docs/forge-openapi-v2.json"),
    "utf-8",
  ),
) as { components: { schemas: Record<string, SpecSchema> } };
const SCHEMAS = spec.components.schemas;

function deref(schema: SpecSchema): SpecSchema {
  let current = schema;
  while (current.$ref) {
    const { $ref, ...rest } = current;
    current = { ...SCHEMAS[$ref.split("/").pop()!], ...rest };
  }
  if (current.allOf) {
    const parts = current.allOf.map(deref);
    return {
      type: "object",
      properties: Object.assign({}, ...parts.map((part) => part.properties)),
      required: parts.flatMap((part) => part.required ?? []),
    };
  }
  return current;
}

interface Shape {
  types: Set<string>;
  nullable: boolean;
  values?: unknown[];
}

/** The JSON types, nullability and enum values of a spec field. */
function specShape(schema: SpecSchema): Shape {
  const current = deref(schema);
  const alternatives = current.anyOf ?? current.oneOf;
  if (alternatives) {
    const shapes = alternatives.map(specShape);
    const values = shapes.every((shape) => shape.values)
      ? shapes.flatMap((shape) => shape.values!)
      : undefined;
    return {
      types: new Set(shapes.flatMap((shape) => [...shape.types])),
      nullable: shapes.some((shape) => shape.nullable),
      values,
    };
  }
  const list = Array.isArray(current.type) ? current.type : [current.type ?? "unknown"];
  const types = new Set(
    list.filter((type) => type !== "null").map((type) => (type === "integer" ? "number" : type)),
  );
  return {
    types,
    nullable: list.includes("null") || (current.enum?.includes(null) ?? false),
    values: current.enum?.filter((value) => value !== null),
  };
}

/** The JSON types, nullability and picklist values of a Valibot field. */
function valibotShape(node: ValibotNode): Shape & { optional: boolean } {
  switch (node.type) {
    case "optional":
      return { ...valibotShape(node.wrapped!), optional: true };
    case "nullable":
      return { ...valibotShape(node.wrapped!), nullable: true };
    case "union": {
      const shapes = (node.options as ValibotNode[]).map(valibotShape);
      return {
        types: new Set(shapes.flatMap((shape) => [...shape.types])),
        nullable: shapes.some((shape) => shape.nullable),
        optional: false,
      };
    }
    case "picklist": {
      const values = node.options as unknown[];
      return { types: new Set([typeof values[0]]), nullable: false, optional: false, values };
    }
    case "record":
      return { types: new Set(["object"]), nullable: false, optional: false };
    case "unknown":
      return { types: new Set(["unknown"]), nullable: true, optional: false };
    default:
      return { types: new Set([node.type]), nullable: false, optional: false };
  }
}

/** Each Valibot attribute schema and the spec resources that it reads. */
const ATTRIBUTES: Array<[keyof typeof attributes, string[]]> = [
  ["UserAttributesSchema", ["UserResource"]],
  ["ServerAttributesSchema", ["ServerResource"]],
  ["SiteAttributesSchema", ["SiteResource"]],
  ["DomainAttributesSchema", ["DomainRecordResource"]],
  ["LoadBalancingNodeAttributesSchema", ["LoadBalancingNodeResource"]],
  ["DeploymentAttributesSchema", ["DeploymentResource"]],
  ["DeploymentStatusAttributesSchema", ["DeploymentStatusResource"]],
  ["DeploymentOutputAttributesSchema", ["DeploymentOutputResource"]],
  ["DeploymentScriptAttributesSchema", ["DeploymentScriptResource"]],
  ["DatabaseAttributesSchema", ["DatabaseResource"]],
  ["DatabaseUserAttributesSchema", ["DatabaseUserResource"]],
  ["BackgroundProcessAttributesSchema", ["BackgroundProcessResource"]],
  ["BackgroundProcessLogAttributesSchema", ["BackgroundProcessLogResource"]],
  ["CertificateAttributesSchema", ["CertificateResource"]],
  ["FirewallRuleAttributesSchema", ["RuleResource"]],
  ["SshKeyAttributesSchema", ["KeyResource"]],
  ["SecurityRuleAttributesSchema", ["SecurityRuleResource"]],
  ["RedirectRuleAttributesSchema", ["RedirectRuleResource"]],
  ["MonitorAttributesSchema", ["MonitorResource"]],
  ["NginxTemplateAttributesSchema", ["NginxTemplateResource"]],
  ["RecipeAttributesSchema", ["RecipeResource"]],
  ["ScheduledJobAttributesSchema", ["JobResource"]],
  ["CommandAttributesSchema", ["CommandResource"]],
  ["BackupConfigAttributesSchema", ["BackupConfigurationResource"]],
  ["BackupAttributesSchema", ["BackupResource"]],
  ["StorageProviderAttributesSchema", ["StorageProviderResource"]],
  ["OrganizationAttributesSchema", ["OrganizationResource"]],
  ["TeamAttributesSchema", ["TeamResource"]],
  ["EnvironmentAttributesSchema", ["EnvironmentResource"]],
  ["PhpVersionAttributesSchema", ["PhpVersionResource"]],
  [
    "PhpConfigAttributesSchema",
    ["PhpFpmConfigurationResource", "PhpCliConfigurationResource", "PhpPoolConfigurationResource"],
  ],
  ["PhpMaxUploadSizeAttributesSchema", ["PhpMaxUploadSizeResource"]],
  ["PhpMaxExecutionTimeAttributesSchema", ["PhpMaxExecutionTimeResource"]],
  ["PhpOpcacheAttributesSchema", ["PhpOpcacheResource"]],
  [
    "LogAttributesSchema",
    [
      "ServerLogResource",
      "NginxAccessLogResource",
      "NginxErrorLogResource",
      "ApplicationLogResource",
    ],
  ],
  ["OutputAttributesSchema", ["CommandOutputResource", "JobOutputResource", "EventOutputResource"]],
  ["EventAttributesSchema", ["EventResource"]],
  ["DeployHookAttributesSchema", ["DeployHookResource"]],
  ["DeploymentWebhookAttributesSchema", ["DeploymentWebhookResource"]],
  ["DeployKeyAttributesSchema", ["DeployKeyResource"]],
  ["DomainRecordConfigurationAttributesSchema", ["DomainRecordConfigurationResource"]],
  ["NginxConfigAttributesSchema", ["NginxConfigResource"]],
  ["HealthcheckEndpointAttributesSchema", ["HealthcheckEndpointResource"]],
  ["HeartbeatAttributesSchema", ["HeartbeatResource"]],
  ["ComposerCredentialAttributesSchema", ["ComposerCredentialResource"]],
  ["NpmCredentialAttributesSchema", ["NpmCredentialResource"]],
  ["HorizonIntegrationAttributesSchema", ["HorizonIntegrationResource"]],
  ["InertiaIntegrationAttributesSchema", ["InertiaIntegrationResource"]],
  ["LaravelMaintenanceIntegrationAttributesSchema", ["LaravelMaintenanceIntegrationResource"]],
  ["LaravelSchedulerIntegrationAttributesSchema", ["LaravelSchedulerIntegrationResource"]],
  ["OctaneIntegrationAttributesSchema", ["OctaneIntegrationResource"]],
  ["PulseIntegrationAttributesSchema", ["PulseIntegrationResource"]],
  ["ReverbIntegrationAttributesSchema", ["ReverbIntegrationResource"]],
  ["ServerKeyAttributesSchema", ["ServerKeyResource"]],
  ["RecipeLogAttributesSchema", ["RecipeLogResource"]],
  ["ForgeRecipeAttributesSchema", ["ForgeRecipeResource"]],
  ["MembershipAttributesSchema", ["MembershipResource"]],
  ["TeamInvitationAttributesSchema", ["TeamInvitationResource"]],
  ["RoleAttributesSchema", ["RoleResource", "CustomRoleResource", "PredefinedRoleResource"]],
  ["PermissionAttributesSchema", ["PermissionResource"]],
  ["ProviderAttributesSchema", ["ProviderResource"]],
  ["ProviderRegionAttributesSchema", ["ProviderRegionResource"]],
  ["ProviderSizeAttributesSchema", ["ProviderSizeResource"]],
  ["ProviderRegionSizeAttributesSchema", ["ProviderRegionSizeResource"]],
  ["ServerCredentialAttributesSchema", ["ServerCredentialResource"]],
  ["VpcAttributesSchema", ["VpcResource"]],
];

/** Each Valibot request schema and the spec request that it builds. */
const REQUESTS: Array<[keyof typeof types, string]> = [
  ["CreateServerDataSchema", "CreateServerRequest"],
  ["UpdateServerDataSchema", "UpdateServerRequest"],
  ["CreateSiteDataSchema", "CreateSiteRequest"],
  ["UpdateSiteDataSchema", "UpdateSiteRequest"],
  ["CreateDomainDataSchema", "CreateDomainRequest"],
  ["UpdateDomainDataSchema", "UpdateDomainRequest"],
  ["UpdateLoadBalancingNodesDataSchema", "UpdateLoadBalancerRequest"],
  ["CreateCertificateDataSchema", "CreateDomainCertificateRequest"],
  ["CreateDatabaseDataSchema", "CreateDatabaseRequest"],
  ["CreateDatabaseUserDataSchema", "CreateDatabaseUserRequest"],
  ["UpdateDatabaseUserDataSchema", "UpdateDatabaseUserRequest"],
  ["CreateDaemonDataSchema", "CreateBackgroundProcessRequest"],
  ["UpdateDaemonDataSchema", "UpdateBackgroundProcessRequest"],
  ["CreateBackupConfigDataSchema", "CreateBackupConfigurationRequest"],
  ["UpdateBackupConfigDataSchema", "UpdateBackupConfigurationRequest"],
  ["CreateCommandDataSchema", "RunSiteCommandRequest"],
  ["CreateScheduledJobDataSchema", "CreateScheduledJobRequest"],
  ["CreateFirewallRuleDataSchema", "CreateFirewallRuleRequest"],
  ["CreateSshKeyDataSchema", "CreateSshKeyRequest"],
  ["CreateSecurityRuleDataSchema", "CreateSecurityRuleRequest"],
  ["UpdateSecurityRuleDataSchema", "UpdateSecurityRuleRequest"],
  ["CreateRedirectRuleDataSchema", "CreateRedirectRequest"],
  ["CreateMonitorDataSchema", "CreateMonitorRequest"],
  ["CreateNginxTemplateDataSchema", "CreateNginxTemplateRequest"],
  ["CreateStorageProviderDataSchema", "CreateStorageConfigurationRequest"],
  ["UpdateStorageProviderDataSchema", "UpdateStorageConfigurationRequest"],
  ["CreateRecipeDataSchema", "CreateRecipeRequest"],
  ["UpdateRecipeDataSchema", "UpdateRecipeRequest"],
  ["ArchiveServerDataSchema", "ArchiveRequest"],
  ["UpdateServerNetworkDataSchema", "UpdateServerNetworkRequest"],
  ["CreatePhpVersionDataSchema", "CreatePhpVersionRequest"],
  ["UpdatePhpDefaultVersionDataSchema", "UpdatePhpCliVersionRequest"],
  ["UpdatePhpSettingsDataSchema", "UpdatePhpSettingsRequest"],
  ["UpdatePhpPoolDataSchema", "UpdatePhpPoolRequest"],
  ["UpdateDatabasePasswordDataSchema", "UpdateDatabasePasswordRequest"],
  ["RestoreBackupDataSchema", "RestoreBackupRequest"],
  ["UpdateGitDataSchema", "UpdateGitRequest"],
  ["DomainActionDataSchema", "DomainActionRequest"],
  ["EnableMaintenanceModeDataSchema", "EnableMaintenanceModeRequest"],
  ["EnableOctaneDataSchema", "EnableOctaneRequest"],
  ["EnableReverbDataSchema", "EnableReverbRequest"],
  ["UpdateHealthcheckEndpointDataSchema", "UpdateHealthcheckEndpointRequest"],
  ["CreateHeartbeatDataSchema", "CreateHeartbeatRequest"],
  ["UpdateHeartbeatDataSchema", "UpdateHeartbeatRequest"],
  ["CreateComposerCredentialDataSchema", "CreateComposerCredentialRequest"],
  ["UpdateComposerCredentialDataSchema", "UpdateComposerCredentialRequest"],
  ["CreateNpmCredentialDataSchema", "CreateNpmCredentialRequest"],
  ["UpdateNpmCredentialDataSchema", "UpdateNpmCredentialRequest"],
  ["CreateDeploymentWebhookDataSchema", "CreateDeploymentWebhookRequest"],
  ["ReorderRedirectRulesDataSchema", "ReorderRedirectsRequest"],
  ["RunRecipeDataSchema", "RunRecipeRequest"],
  ["ShareRecipeDataSchema", "ShareRecipeRequest"],
  ["ShareServerDataSchema", "ShareServerRequest"],
  ["ShareCredentialDataSchema", "ShareCredentialRequest"],
  ["CreateTeamDataSchema", "CreateTeamRequest"],
  ["UpdateTeamDataSchema", "UpdateTeamRequest"],
  ["UpdateTeamMemberDataSchema", "UpdateTeamMemberRequest"],
  ["CreateTeamInviteDataSchema", "CreateTeamInviteRequest"],
  ["CreateRoleDataSchema", "CreateRoleRequest"],
  ["UpdateRoleDataSchema", "UpdateRoleRequest"],
  ["CreateVpcDataSchema", "CreateServerProviderNetworkRequest"],
];

/**
 * Spec fields that a request schema does not model, on purpose.
 * Keys are `Request.field`.
 */
const UNMODELLED_REQUEST_FIELDS: Record<string, string> = {
  // Owned by the load balancer branch (`forge load-balancer apply`), which adds it.
  "UpdateLoadBalancerRequest.balancer_keepalive_max_connections": "load balancer branch",
};

/**
 * Spec fields whose type is wrong in the spec, and that a schema types as the API sends them.
 * Keys are `Schema.field`.
 */
const TYPE_EXCEPTIONS: Record<string, string> = {
  // The spec types the IP address as an object; the API takes a string (an IP or a CIDR range).
  "CreateFirewallRuleRequest.ip_address": "string in the API",
};

describe("attribute schemas conform to the spec resources", () => {
  for (const [name, resources] of ATTRIBUTES) {
    for (const resource of resources) {
      it(`${name} ← ${resource}`, () => {
        const entries = (attributes[name] as unknown as ValibotNode).entries!;
        const attrs = deref(deref(SCHEMAS[resource]).properties!.attributes);
        const properties = attrs.properties ?? {};
        const required = attrs.required ?? [];
        const problems: string[] = [];

        for (const [field, specField] of Object.entries(properties)) {
          const ours = entries[field];
          if (!ours) {
            problems.push(`${field}: missing`);
            continue;
          }
          const theirs = specShape(specField);
          const shape = valibotShape(ours);
          if (theirs.nullable && !shape.nullable) problems.push(`${field}: not nullable`);
          if (!required.includes(field) && !shape.optional) problems.push(`${field}: not optional`);
          const missing = [...theirs.types].filter(
            (type) => type !== "unknown" && !shape.types.has(type) && !shape.types.has("unknown"),
          );
          if (missing.length > 0) problems.push(`${field}: does not accept ${missing.join(", ")}`);
        }
        for (const field of Object.keys(entries)) {
          if (!(field in properties)) problems.push(`${field}: not in the spec`);
        }

        expect(problems).toEqual([]);
      });
    }
  }
});

describe("request schemas conform to the spec requests", () => {
  for (const [name, request] of REQUESTS) {
    it(`${name} → ${request}`, () => {
      const entries = (types[name] as unknown as ValibotNode).entries!;
      const body = deref(SCHEMAS[request]);
      const properties = body.properties ?? {};
      const required = body.required ?? [];
      const problems: string[] = [];

      for (const [field, ours] of Object.entries(entries)) {
        const specField = properties[field];
        if (!specField) {
          problems.push(`${field}: not in the spec`);
          continue;
        }
        const shape = valibotShape(ours);
        const theirs = specShape(specField);
        if (required.includes(field) && shape.optional) problems.push(`${field}: not required`);
        if (shape.nullable && !theirs.nullable && !shape.types.has("unknown")) {
          problems.push(`${field}: nullable`);
        }
        if (`${request}.${field}` in TYPE_EXCEPTIONS) continue;
        const extra = [...shape.types].filter(
          (type) => type !== "unknown" && !theirs.types.has(type),
        );
        if (extra.length > 0) problems.push(`${field}: sends ${extra.join(", ")}`);
        if (shape.values && theirs.values) {
          const unknown = shape.values.filter((value) => !theirs.values!.includes(value));
          if (unknown.length > 0) problems.push(`${field}: values ${unknown.join(", ")}`);
        }
      }
      for (const field of Object.keys(properties)) {
        if (!(field in entries) && !(`${request}.${field}` in UNMODELLED_REQUEST_FIELDS)) {
          problems.push(`${field}: missing`);
        }
      }

      expect(problems).toEqual([]);
    });
  }
});

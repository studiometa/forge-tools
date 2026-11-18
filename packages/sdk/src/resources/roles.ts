import type {
  CreateRoleData,
  PermissionAttributes,
  RoleAttributes,
  UpdateRoleData,
} from "@studiometa/forge-api";

import type { AllOptions, ListOptions } from "../list-options.ts";
import type { AsyncPaginatedIterator } from "../pagination.ts";

import { BaseCollection } from "./base.ts";

/** Options for listing roles. */
export type RoleListOptions = ListOptions<
  "name" | "permissions.name",
  never,
  "permissions" | "permissionsCount" | "permissionsExists"
>;

/** Options for listing permissions. */
export type PermissionListOptions = ListOptions<"name">;

/**
 * The custom roles of the organization.
 *
 * Access via `forge.roles`.
 *
 * @example
 * ```ts
 * const role = await forge.roles.create({ name: 'Deployer', permissions: ['site:manage-deploys'] });
 * ```
 */
export class RolesCollection extends BaseCollection {
  /** @internal */
  private get basePath(): string {
    return `/orgs/${this.orgSlug}/roles`;
  }

  /**
   * List the custom roles of the organization.
   *
   * @example
   * ```ts
   * const roles = await forge.roles.list({ include: ['permissions'] });
   * ```
   */
  async list(options: RoleListOptions = {}): Promise<Array<RoleAttributes & { id: number }>> {
    return this.listPage<RoleAttributes>(this.basePath, options);
  }

  /**
   * Iterate over all the custom roles of the organization.
   *
   * @example
   * ```ts
   * const roles = await forge.roles.all().toArray();
   * ```
   */
  all(
    options: AllOptions<RoleListOptions> = {},
  ): AsyncPaginatedIterator<RoleAttributes & { id: number }> {
    return this.iterate<RoleAttributes>(this.basePath, options);
  }

  /**
   * Get a custom role.
   *
   * @example
   * ```ts
   * const role = await forge.roles.get(3);
   * ```
   */
  async get(roleId: number): Promise<RoleAttributes & { id: number }> {
    return this.getResource<RoleAttributes>(`${this.basePath}/${roleId}`);
  }

  /**
   * Create a custom role.
   *
   * @example
   * ```ts
   * const role = await forge.roles.create({ name: 'Deployer', permissions: ['site:manage-deploys'] });
   * ```
   */
  async create(data: CreateRoleData): Promise<RoleAttributes & { id: number }> {
    return this.postResource<RoleAttributes>(this.basePath, data);
  }

  /**
   * Update a custom role.
   *
   * @example
   * ```ts
   * await forge.roles.update(3, { name: 'Deployer', description: 'Deploys the sites' });
   * ```
   */
  async update(
    roleId: number,
    data: UpdateRoleData & { description?: string },
  ): Promise<RoleAttributes & { id: number }> {
    return this.putResource<RoleAttributes>(`${this.basePath}/${roleId}`, data);
  }

  /**
   * Delete a custom role.
   *
   * @example
   * ```ts
   * await forge.roles.delete(3);
   * ```
   */
  async delete(roleId: number): Promise<void> {
    await this.client.delete(`${this.basePath}/${roleId}`);
  }

  /**
   * List the permissions of a custom role.
   *
   * @example
   * ```ts
   * const permissions = await forge.roles.permissions(3);
   * ```
   */
  async permissions(
    roleId: number,
    options: PermissionListOptions = {},
  ): Promise<Array<PermissionAttributes & { id: number }>> {
    return this.listPage<PermissionAttributes>(`${this.basePath}/${roleId}/permissions`, options);
  }
}

/**
 * The roles that Forge defines for every organization.
 *
 * Access via `forge.predefinedRoles`.
 *
 * @example
 * ```ts
 * const roles = await forge.predefinedRoles.list();
 * ```
 */
export class PredefinedRolesCollection extends BaseCollection {
  /**
   * List the predefined roles.
   *
   * @example
   * ```ts
   * const roles = await forge.predefinedRoles.list();
   * ```
   */
  async list(options: RoleListOptions = {}): Promise<Array<RoleAttributes & { id: number }>> {
    return this.listPage<RoleAttributes>("/predefined-roles", options);
  }

  /**
   * Get a predefined role.
   *
   * @example
   * ```ts
   * const role = await forge.predefinedRoles.get(1);
   * ```
   */
  async get(roleId: number): Promise<RoleAttributes & { id: number }> {
    return this.getResource<RoleAttributes>(`/predefined-roles/${roleId}`);
  }
}

/**
 * The permissions that a role can grant.
 *
 * Access via `forge.permissions`.
 *
 * @example
 * ```ts
 * const permissions = await forge.permissions.list({ filter: { name: 'site' } });
 * ```
 */
export class PermissionsCollection extends BaseCollection {
  /**
   * List the permissions.
   *
   * @example
   * ```ts
   * const permissions = await forge.permissions.list();
   * ```
   */
  async list(
    options: PermissionListOptions = {},
  ): Promise<Array<PermissionAttributes & { id: number }>> {
    return this.listPage<PermissionAttributes>("/permissions", options);
  }

  /**
   * Get a permission.
   *
   * @example
   * ```ts
   * const permission = await forge.permissions.get(4);
   * ```
   */
  async get(permissionId: number): Promise<PermissionAttributes & { id: number }> {
    return this.getResource<PermissionAttributes>(`/permissions/${permissionId}`);
  }
}

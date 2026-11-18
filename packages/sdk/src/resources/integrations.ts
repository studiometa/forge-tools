import type {
  EnableMaintenanceModeData,
  EnableOctaneData,
  EnableReverbData,
  HorizonIntegrationAttributes,
  HttpClient,
  InertiaIntegrationAttributes,
  LaravelMaintenanceIntegrationAttributes,
  LaravelSchedulerIntegrationAttributes,
  OctaneIntegrationAttributes,
  PulseIntegrationAttributes,
  ReverbIntegrationAttributes,
} from "@studiometa/forge-api";

import { SiteScoped } from "./site-scoped.ts";

/**
 * An integration of a Laravel site that Forge can only enable (Inertia).
 */
export class EnableOnlyIntegrationResource<TAttributes, TData = undefined> extends SiteScoped {
  /** @internal */
  constructor(
    client: HttpClient,
    orgSlug: string,
    serverId: number,
    siteId: number,
    private readonly name: string,
  ) {
    super(client, orgSlug, serverId, siteId);
  }

  /** @internal */
  protected get path(): string {
    return `${this.sitePath}/integrations/${this.name}`;
  }

  /**
   * Get the state of the integration.
   *
   * @example
   * ```ts
   * const horizon = await forge.server(123).site(456).integrations.horizon.get();
   * ```
   */
  async get(): Promise<TAttributes & { id: number }> {
    return this.getResource<TAttributes>(this.path);
  }

  /**
   * Enable the integration.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).integrations.horizon.enable();
   * await forge.server(123).site(456).integrations.octane.enable({ port: '8000', server: 'swoole' });
   * ```
   */
  async enable(...data: TData extends undefined ? [] : [TData]): Promise<void> {
    await this.client.post(this.path, ...data);
  }
}

/**
 * An integration of a Laravel site: Horizon, Octane, Reverb, Pulse, maintenance mode or scheduler.
 */
export class IntegrationResource<
  TAttributes,
  TData = undefined,
> extends EnableOnlyIntegrationResource<TAttributes, TData> {
  /**
   * Disable the integration.
   *
   * @example
   * ```ts
   * await forge.server(123).site(456).integrations.horizon.disable();
   * ```
   */
  async disable(): Promise<void> {
    await this.client.delete(this.path);
  }
}

/**
 * The Laravel integrations of a site.
 *
 * Access via `forge.server(id).site(id).integrations`.
 *
 * @example
 * ```ts
 * await forge.server(123).site(456).integrations.maintenance.enable({ status: 503 });
 * ```
 */
export class IntegrationsResource {
  /** Laravel Horizon daemon. */
  readonly horizon: IntegrationResource<HorizonIntegrationAttributes>;

  /** Laravel Octane daemon. */
  readonly octane: IntegrationResource<OctaneIntegrationAttributes, EnableOctaneData>;

  /** Laravel Reverb daemon. */
  readonly reverb: IntegrationResource<ReverbIntegrationAttributes, EnableReverbData>;

  /** Inertia server-side rendering. Forge cannot disable it. */
  readonly inertia: EnableOnlyIntegrationResource<InertiaIntegrationAttributes>;

  /** Laravel Pulse daemon. */
  readonly pulse: IntegrationResource<PulseIntegrationAttributes>;

  /** Laravel maintenance mode (`php artisan down`). */
  readonly maintenance: IntegrationResource<
    LaravelMaintenanceIntegrationAttributes,
    EnableMaintenanceModeData
  >;

  /** Laravel scheduler (`php artisan schedule:run` each minute). */
  readonly scheduler: IntegrationResource<LaravelSchedulerIntegrationAttributes>;

  /** @internal */
  constructor(client: HttpClient, orgSlug: string, serverId: number, siteId: number) {
    const args = [client, orgSlug, serverId, siteId] as const;
    this.horizon = new IntegrationResource(...args, "horizon");
    this.octane = new IntegrationResource(...args, "octane");
    this.reverb = new IntegrationResource(...args, "reverb");
    this.inertia = new EnableOnlyIntegrationResource(...args, "inertia");
    this.pulse = new IntegrationResource(...args, "pulse");
    this.maintenance = new IntegrationResource(...args, "laravel-maintenance");
    this.scheduler = new IntegrationResource(...args, "laravel-scheduler");
  }
}

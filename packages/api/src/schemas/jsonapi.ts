// ── JSON:API envelope schema factories for Forge v2 API ───
// Generic schema factories that wrap attribute schemas
// in JSON:API document structure.

import * as v from "valibot";

/**
 * A JSON:API resource identifier (type + id reference).
 */
export const JsonApiResourceIdentifierSchema = v.object({
  type: v.string(),
  id: v.string(),
});

export type JsonApiResourceIdentifier = v.InferOutput<typeof JsonApiResourceIdentifierSchema>;

/**
 * A JSON:API relationship object.
 */
export const JsonApiRelationshipSchema = v.object({
  data: v.nullable(
    v.union([JsonApiResourceIdentifierSchema, v.array(JsonApiResourceIdentifierSchema)]),
  ),
});

export type JsonApiRelationship = v.InferOutput<typeof JsonApiRelationshipSchema>;

/**
 * A JSON:API link object.
 */
export const JsonApiLinkSchema = v.object({
  href: v.string(),
  rel: v.optional(v.string()),
  describedby: v.optional(v.string()),
  title: v.optional(v.string()),
  type: v.optional(v.string()),
  hreflang: v.optional(v.string()),
});

export type JsonApiLink = v.InferOutput<typeof JsonApiLinkSchema>;

/**
 * Create a JSON:API resource schema for given attributes.
 */
export function jsonApiResourceSchema<T extends v.GenericSchema>(attrs: T) {
  return v.object({
    id: v.string(),
    type: v.string(),
    attributes: attrs,
    relationships: v.optional(v.record(v.string(), JsonApiRelationshipSchema)),
    links: v.optional(
      v.object({
        self: v.optional(JsonApiLinkSchema),
      }),
    ),
  });
}

/** A JSON:API resource object. */
export type JsonApiResource<T> = {
  id: string;
  type: string;
  attributes: T;
  relationships?: Record<string, JsonApiRelationship>;
  links?: {
    self?: JsonApiLink;
  };
};

/**
 * Pagination links in a JSON:API list response.
 */
export const JsonApiPaginationLinksSchema = v.looseObject({
  first: v.optional(v.nullable(v.string())),
  last: v.optional(v.nullable(v.string())),
  prev: v.optional(v.nullable(v.string())),
  next: v.optional(v.nullable(v.string())),
});

export type JsonApiPaginationLinks = v.InferOutput<typeof JsonApiPaginationLinksSchema>;

/**
 * Pagination metadata in a JSON:API list response.
 */
export const JsonApiPaginationMetaSchema = v.looseObject({
  path: v.optional(v.nullable(v.string())),
  per_page: v.number(),
  next_cursor: v.optional(v.nullable(v.string())),
  prev_cursor: v.optional(v.nullable(v.string())),
});

export type JsonApiPaginationMeta = v.InferOutput<typeof JsonApiPaginationMetaSchema>;

/**
 * Create a JSON:API single-resource document schema.
 */
export function jsonApiDocumentSchema<T extends v.GenericSchema>(attrs: T) {
  return v.object({
    data: jsonApiResourceSchema(attrs),
  });
}

/** A JSON:API document with a single resource. */
export type JsonApiDocument<T> = {
  data: JsonApiResource<T>;
};

/**
 * Create a JSON:API list document schema (paginated).
 */
export function jsonApiListDocumentSchema<T extends v.GenericSchema>(attrs: T) {
  return v.object({
    data: v.array(jsonApiResourceSchema(attrs)),
    links: JsonApiPaginationLinksSchema,
    meta: JsonApiPaginationMetaSchema,
  });
}

/** A JSON:API document with a collection of resources (paginated). */
export type JsonApiListDocument<T> = {
  data: JsonApiResource<T>[];
  links: JsonApiPaginationLinks;
  meta: JsonApiPaginationMeta;
};

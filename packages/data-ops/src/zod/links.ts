import { z } from "zod";
import { LinkClickMessageType } from "./queue";
import { getDb } from "@/db/database";
import { linkClicks } from "@/drizzle-out/schema";

export const destinationsSchema = z.preprocess(
  (obj) => {
    if (typeof obj === "string") {
      console.log(obj);
      return JSON.parse(obj);
    }
    return obj;
  },
  z
    .object({
      default: z.string().url(),
    })
    .catchall(z.string().url()),
);

export type DestinationsSchemaType = z.infer<typeof destinationsSchema>;

export const linkSchema = z.object({
  linkId: z.string(),
  accountId: z.string(),
  name: z.string().min(1).max(100),
  destinations: destinationsSchema,
  created: z.string(),
  updated: z.string(),
});
export const createLinkSchema = linkSchema.omit({
  created: true,
  updated: true,
  accountId: true,
  linkId: true,
});

export const cloudflareInfoSchema = z.object({
  country: z.string().optional(),
  latitude: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
  longitude: z
    .string()
    .transform((val) => (val ? Number(val) : undefined))
    .optional(),
});

export const durableObjectGeoClickSchama = z.object({
  latitude: z.number(),
  longitude: z.number(),
  time: z.number(),
  country: z.string(),
});

export const durableObjectGeoClickArraySchema = z.array(
  durableObjectGeoClickSchama,
);

export type DurableObjectGeoClickSchemaType = z.infer<
  typeof durableObjectGeoClickSchama
>;

export type CloudflareInfoSchemaType = z.infer<typeof cloudflareInfoSchema>;

export type LinkSchemaType = z.infer<typeof linkSchema>;
export type CreateLinkSchemaType = z.infer<typeof createLinkSchema>;

export async function addLinkClick(info: LinkClickMessageType["data"]) {
  const db = getDb();
  await db.insert(linkClicks).values({
    id: info.id,
    accountId: info.accountId,
    destination: info.destination,
    country: info.country,
    clickedTime: info.timestamp,
    latitude: info.latitude,
    longitude: info.longitude,
  });
}

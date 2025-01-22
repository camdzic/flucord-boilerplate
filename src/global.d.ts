import type { PrismaClient } from "@prisma/client";

declare module "flucord" {
  interface Flucord {
    prisma: PrismaClient;
  }
}

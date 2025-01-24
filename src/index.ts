import { PrismaClient } from "@prisma/client";
import { Partials } from "discord.js";
import { Flucord } from "flucord";

const flucord = new Flucord({
  intents: [],
  partials: [
    Partials.Channel,
    Partials.Message,
    Partials.User,
    Partials.GuildMember,
    Partials.Reaction
  ]
});

flucord.prisma = new PrismaClient();

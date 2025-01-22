import { PrismaClient } from "@prisma/client";
import { Partials } from "discord.js";
import { Flucord } from "flucord";

class ExtendedFlucord extends Flucord {
  constructor() {
    super({
      intents: [],
      partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User,
        Partials.GuildMember,
        Partials.Reaction
      ]
    });

    this.prisma = new PrismaClient();
  }
}

new ExtendedFlucord();

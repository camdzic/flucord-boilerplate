import type { ChatInputCommandInteraction } from "discord.js";
import { BaseSlashCommand, type Flucord } from "flucord";

export class PingSlashCommand extends BaseSlashCommand {
  constructor(flucord: Flucord) {
    super(flucord, {
      name: "ping",
      description: "Pong!",
      category: "general",
      guildPlusUser: true
    });
  }

  async execute(interaction: ChatInputCommandInteraction) {
    await this.flucord.prisma.commandExecution.create({
      data: {
        name: interaction.commandName,
        user: {
          connectOrCreate: {
            where: {
              id: interaction.user.id
            },
            create: {
              id: interaction.user.id
            }
          }
        }
      }
    });

    const pingInteraction = await interaction.reply({
      content: "Pong! 🏓",
      withResponse: true
    });

    if (pingInteraction.resource && pingInteraction.resource.message) {
      return interaction.editReply({
        content: `Bot Latency: ${pingInteraction.resource.message.createdTimestamp - interaction.createdTimestamp}ms\nWebSocket Latency: ${Math.round(
          this.flucord.client.ws.ping
        )}ms`
      });
    }
  }
}

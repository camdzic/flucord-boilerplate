import {
  type CacheType,
  ChannelType,
  type ChatInputCommandInteraction
} from "discord.js";
import {
  BaseSlashCommand,
  ChannelTypeGuard,
  type Flucord,
  Time
} from "flucord";
import { CooldownGuard } from "../../../guards/CooldownGuard";

export class PingSlashCommand extends BaseSlashCommand {
  constructor(flucord: Flucord) {
    super(flucord, {
      name: "ping",
      description: "Pong!",
      category: "general",
      guildPlusUser: true,
      guards: [
        new ChannelTypeGuard(
          ChannelType.GuildText,
          ChannelType.DM,
          ChannelType.GroupDM
        ),
        new CooldownGuard(
          interaction => {
            // If the user has nitro, the cooldown is 30 seconds
            if (interaction.member.premiumSince) {
              return Time.Second * 30;
            }

            // Otherwise, the cooldown is 1 minute
            return Time.Minute;
          },
          interaction => {
            if (interaction.member.premiumSince) {
              // If the user has nitro, the threshold is 3 uses
              return 3;
            }

            // Otherwise, the threshold is 1 use
            return 1;
          }
        )
      ]
    });
  }

  async execute(interaction: ChatInputCommandInteraction<CacheType>) {
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

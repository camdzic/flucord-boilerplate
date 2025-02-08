import { RateLimitManager } from "@sapphire/ratelimits";
import {
  type ButtonInteraction,
  type CacheType,
  type ChannelSelectMenuInteraction,
  type ChatInputCommandInteraction,
  InteractionType,
  type MentionableSelectMenuInteraction,
  type MessageContextMenuCommandInteraction,
  type ModalSubmitInteraction,
  type RoleSelectMenuInteraction,
  type StringSelectMenuInteraction,
  type UserContextMenuCommandInteraction,
  type UserSelectMenuInteraction
} from "discord.js";
import {
  BaseGuard,
  CooldownGuardException,
  GuardExecutionFailException,
  Time
} from "flucord";

type CooldownResolver = (
  interaction:
    | ChatInputCommandInteraction<"cached">
    | MessageContextMenuCommandInteraction<"cached">
    | UserContextMenuCommandInteraction<"cached">
    | ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">
    | ChannelSelectMenuInteraction<"cached">
    | RoleSelectMenuInteraction<"cached">
    | MentionableSelectMenuInteraction<"cached">
    | UserSelectMenuInteraction<"cached">
    | ModalSubmitInteraction<"cached">
) => number;

export class CooldownGuard extends BaseGuard<"any"> {
  private readonly rateLimitManagers: Map<string, RateLimitManager>;

  private time: CooldownResolver | number;
  private threshold: CooldownResolver | number;

  constructor(
    time: CooldownResolver | number,
    threshold: CooldownResolver | number = 1
  ) {
    super({
      types: ["any"]
    });

    this.rateLimitManagers = new Map();

    this.time = time;
    this.threshold = threshold;
  }

  execute(
    interaction:
      | ChatInputCommandInteraction<CacheType>
      | MessageContextMenuCommandInteraction<CacheType>
      | UserContextMenuCommandInteraction<CacheType>
      | ButtonInteraction<CacheType>
      | StringSelectMenuInteraction<CacheType>
      | ChannelSelectMenuInteraction<CacheType>
      | RoleSelectMenuInteraction<CacheType>
      | MentionableSelectMenuInteraction<CacheType>
      | UserSelectMenuInteraction<CacheType>
      | ModalSubmitInteraction<CacheType>
  ) {
    if (!interaction.inCachedGuild()) {
      throw new GuardExecutionFailException(
        "While executing CooldownGuard, guild was not found"
      );
    }

    const identifier = this.getInteractionIdentifier(interaction);
    const realTime = this.resolveValue(this.time, interaction);
    const realThreshold = this.resolveValue(this.threshold, interaction);

    if (!interaction.member.permissions.has("ManageGuild")) {
      const rateLimitManager = this.getRateLimitManager(
        identifier,
        realTime,
        realThreshold
      );

      const rateLimit = rateLimitManager.acquire(
        `${interaction.guild.id}:${interaction.user.id}`
      );
      if (rateLimit.limited) {
        throw new CooldownGuardException(
          `You can use this command again in \`${this.formatCooldownTime(
            rateLimit.remainingTime
          )}\``
        );
      }

      rateLimit.consume();
    }
  }

  private getInteractionIdentifier(
    interaction:
      | ChatInputCommandInteraction<"cached">
      | MessageContextMenuCommandInteraction<"cached">
      | UserContextMenuCommandInteraction<"cached">
      | ButtonInteraction<"cached">
      | StringSelectMenuInteraction<"cached">
      | ChannelSelectMenuInteraction<"cached">
      | RoleSelectMenuInteraction<"cached">
      | MentionableSelectMenuInteraction<"cached">
      | UserSelectMenuInteraction<"cached">
      | ModalSubmitInteraction<"cached">
  ) {
    switch (interaction.type) {
      case InteractionType.ApplicationCommand: {
        return interaction.commandId;
      }
      case InteractionType.MessageComponent: {
        return interaction.customId;
      }
      case InteractionType.ModalSubmit: {
        return interaction.customId;
      }
    }
  }

  private resolveValue(
    source: CooldownResolver | number,
    interaction:
      | ChatInputCommandInteraction<"cached">
      | MessageContextMenuCommandInteraction<"cached">
      | UserContextMenuCommandInteraction<"cached">
      | ButtonInteraction<"cached">
      | StringSelectMenuInteraction<"cached">
      | ChannelSelectMenuInteraction<"cached">
      | RoleSelectMenuInteraction<"cached">
      | MentionableSelectMenuInteraction<"cached">
      | UserSelectMenuInteraction<"cached">
      | ModalSubmitInteraction<"cached">
  ) {
    return typeof source === "function" ? source(interaction) : source;
  }

  private getRateLimitManager(
    commandId: string,
    interval: number,
    limit: number
  ) {
    const existingManager = this.rateLimitManagers.get(commandId);
    if (existingManager) {
      return existingManager;
    }

    const newManager = new RateLimitManager(interval, limit);
    this.rateLimitManagers.set(commandId, newManager);
    return newManager;
  }

  private formatCooldownTime(remainingTime: number) {
    const units = [
      { label: "d", value: Time.Day },
      { label: "h", value: Time.Hour },
      { label: "m", value: Time.Minute },
      { label: "s", value: Time.Second }
    ];

    for (const { label, value } of units) {
      const time = remainingTime / value;
      if (time >= 1) {
        return `${time.toFixed(2)}${label}`;
      }
    }

    return `${remainingTime}ms`;
  }
}

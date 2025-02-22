import { BaseEvent, type Flucord } from "flucord";

export class ReadyEvent extends BaseEvent<"ready"> {
  constructor(flucord: Flucord) {
    super(flucord, {
      event: "ready"
    });
  }

  async execute() {
    await this.connectToDatabase();

    process.on("unhandledRejection", error => {
      this.flucord.logger.error("Unhandled rejection");
      this.flucord.logger.error(error);
    });
    process.on("uncaughtException", error => {
      this.flucord.logger.error("Uncaught exception");
      this.flucord.logger.error(error);
    });
  }

  private async connectToDatabase() {
    try {
      await this.flucord.prisma.$connect();
      this.flucord.logger.info("Connected to the database");
    } catch (error) {
      this.flucord.logger.error("Failed to connect to the database");
      this.flucord.logger.error(error);
    }
  }
}

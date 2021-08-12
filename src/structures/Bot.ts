import { Client, GuildMember, Interaction, MessageEmbed } from 'discord.js';
import baseEmbedProps from '../util/baseEmbedProps';
import { CommandManager, Database } from '.';

export default class Bot extends Client {
  private _commands = new CommandManager(this);
  public db = new Database(this);

  async start(token: string): Promise<void> {
    await this.db.connect();
    await this.login(token);

    this.on('ready', this._onReady);
    this.on('interactionCreate', this._onInteractionCreate);
  }

  private async _onReady(): Promise<void> {
    if (!this.user) {
      console.error('Client user does not exist');
      process.exit(1);
    }

    if (!this.application?.owner) {
      await this.application?.fetch();
    }

    await this._commands.load();

    console.log(`${this.user.username} successfully started.`);
  }

  private _onInteractionCreate(interaction: Interaction): void {
    const member = interaction.member as GuildMember;

    if (
      !interaction.inGuild() ||
      !interaction.isCommand() ||
      !member ||
      !('id' in member)
    ) {
      return;
    }

    this._commands.run(interaction);
  }

  createBasicEmbed(message: string): MessageEmbed {
    return new MessageEmbed({
      ...baseEmbedProps,
      description: message,
    });
  }
}

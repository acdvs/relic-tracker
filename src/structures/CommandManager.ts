import { promises as fs } from 'fs';
import { resolve, parse } from 'path';
import { Collection, CommandInteraction } from 'discord.js';
import { Command, PossibleUndef } from '../types';
import { Bot } from '.';

export default class CommandManager extends Collection<string, Command> {
  private readonly _path = resolve(__dirname, '..', 'commands');
  private _bot: Bot;

  constructor(bot: Bot) {
    super();
    this._bot = bot;
  }

  async load(): Promise<void> {
    const files = await fs.readdir(this._path);
    const guilds = this._bot.guilds.cache.values();

    for (const file of files) {
      const command = await this._import(file);

      if (!command) {
        continue;
      }

      this.set(command.name, command);

      for (const guild of guilds) {
        await guild.commands.create(command);
      }

      console.log(`Loaded command /${command.name}`);
    }
  }

  run(interaction: CommandInteraction): void {
    const command = this.get(interaction.commandName);
    command?.execute(interaction);
  }

  private async _import(fileName: string): Promise<PossibleUndef<Command>> {
    const filePath = resolve(this._path, fileName);
    const commandFile = await import(filePath);
    const commandClass = commandFile[parse(filePath).name];

    return commandClass ? new commandClass(this._bot) : undefined;
  }
}

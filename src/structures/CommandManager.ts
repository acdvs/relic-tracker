import { promises as fs } from 'fs';
import { resolve, parse } from 'path';
import { Collection, CommandInteraction, Guild } from 'discord.js';
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
    let testGuild: PossibleUndef<Guild>;

    if (process.env.MODE === 'development') {
      testGuild = await this._bot.guilds.fetch(
        process.env.TEST_SERVER_ID as string
      );
    }

    const commands = [];
    const files = await fs.readdir(this._path);

    for (const file of files) {
      commands.push(await this._import(file));
    }

    for (const command of commands) {
      if (!command) {
        continue;
      }

      this.set(command.name, command);

      if (testGuild) {
        await testGuild.commands.create(command);
      } else {
        await this._bot.application?.commands.create(command);
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
    const commandClass = await import(resolve(filePath)).then((m) => {
      return m[parse(filePath).name];
    });

    return commandClass ? new commandClass(this._bot) : undefined;
  }
}

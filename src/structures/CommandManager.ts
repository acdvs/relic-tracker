import { promises as fs } from 'fs';
import { resolve, parse } from 'path';
import { Collection, CommandInteraction } from 'discord.js';
import { Command, PossibleUndef } from '../types';
import { Bot } from '.';

export default class CommandManager extends Collection<string, Command> {
  private _bot: Bot;
  private _path: string;

  constructor(bot: Bot, path: string) {
    super();
    this._bot = bot;
    this._path = path;
  }

  async load(): Promise<void> {
    fs.readdir(this._path)
      .then(async (files) => {
        for (const file of files) {
          const command = await this._import(file);

          if (!command) {
            continue;
          }

          this.set(command.name, command);

          if (process.env.MODE === 'development') {
            const testGuild = await this._bot.guilds.fetch(
              process.env.TEST_SERVER_ID as string
            );
            await testGuild.commands.create(command);
          } else {
            await this._bot.application?.commands.create(command);
          }

          console.log(`Loaded command /${command.name}`);
        }
      })
      .catch((e) => {
        console.error(e);
        process.exit(1);
      });
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

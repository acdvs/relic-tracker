import { CommandInteraction } from 'discord.js';
import { RelicCollection } from '../structures';
import { Command } from '../types';

export class Relics extends Command {
  name = 'relics';
  description = 'List all of your tracked relics.';

  async execute(interaction: CommandInteraction): Promise<void> {
    const member = interaction.member;

    if (!member || !('id' in member)) {
      return;
    }

    const collection: RelicCollection = await this.bot.db.getRelics(member.id);

    interaction.reply({
      content:
        collection.getFormattedList('Your tracked relics') ||
        'You are not tracking any relics yet.',
      ephemeral: true,
    });
  }
}

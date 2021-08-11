import { CommandInteraction, GuildMember } from 'discord.js';
import { RelicCollection } from '../structures';
import { Command } from '../types';

export class Relics extends Command {
  name = 'relics';
  description = 'List all of your tracked relics.';

  async execute(interaction: CommandInteraction): Promise<void> {
    const author = interaction.member as GuildMember;
    const collection: RelicCollection = await this.bot.db.getCollectionById(
      author.id
    );

    interaction.reply({
      embeds: [collection.generateEmbed('Your tracked relics')],
      ephemeral: true,
    });
  }
}

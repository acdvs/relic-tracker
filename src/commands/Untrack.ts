import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from 'discord.js';
import { UpdateResult } from 'mongodb';
import { RelicCollection } from '../structures';
import { Command, PossibleUndef } from '../types';
import { DATABASE_ERROR, INVALID_RELIC } from '../util/sharedMessages';
import { TIER_COUNTS } from '../util/relics';

export class Untrack extends Command {
  name = 'untrack';
  description = 'Stop tracking a relic you are no longer looking for.';
  options = [
    {
      type: 'INTEGER' as ApplicationCommandOptionType,
      name: 'tier',
      description: 'Relic tier',
      required: true,
    },
    {
      type: 'INTEGER' as ApplicationCommandOptionType,
      name: 'number',
      description: 'Relic number',
      required: true,
    },
  ];

  async execute(interaction: CommandInteraction): Promise<void> {
    const tierId = interaction.options.getInteger('tier')!;
    const relicId = interaction.options.getInteger('number')!;
    const amountInTier = TIER_COUNTS[tierId - 1];
    const author = interaction.member as GuildMember;

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ content: INVALID_RELIC, ephemeral: true });
      return;
    }

    const collection: RelicCollection = await this.bot.db.getRelics(author.id);

    if (!collection.hasRelic(tierId, relicId)) {
      interaction.reply({
        content: `You are not tracking relic T${tierId}-${relicId} yet.`,
        ephemeral: true,
      });
      return;
    }

    const result: PossibleUndef<UpdateResult> = await collection.removeRelic(
      tierId,
      relicId
    );

    interaction.reply({
      content: result?.acknowledged
        ? `You are no longer tracking relic T${tierId}-${relicId}.`
        : DATABASE_ERROR,
      ephemeral: true,
    });
  }
}

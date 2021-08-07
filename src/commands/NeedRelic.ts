import { ApplicationCommandOptionType, CommandInteraction } from 'discord.js';
import { UpdateResult } from 'mongodb';
import { RelicCollection } from '../structures';
import { Command, PossibleUndef } from '../types';
import { DATABASE_ERROR, INVALID_RELIC } from '../util/sharedMessages';
import { TIER_COUNTS } from '../util/relics';

export class NeedRelic extends Command {
  name = 'needrelic';
  description =
    'Track a relic you are looking for. You will be pinged if it is found.';
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
    const member = interaction.member;

    if (!member || !('id' in member)) {
      return;
    }

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ content: INVALID_RELIC, ephemeral: true });
      return;
    }

    const collection: RelicCollection = await this.bot.db.getRelics(member.id);

    if (collection.hasRelic(tierId, relicId)) {
      interaction.reply({
        content: `You are already tracking relic T${tierId}-${relicId}.`,
        ephemeral: true,
      });
      return;
    }

    const result: PossibleUndef<UpdateResult> = await collection.addRelic(
      tierId,
      relicId
    );

    interaction.reply({
      content: result?.acknowledged
        ? `You are now tracking relic T${tierId}-${relicId}.`
        : DATABASE_ERROR,
      ephemeral: true,
    });
  }
}

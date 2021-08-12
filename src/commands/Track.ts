import {
  ApplicationCommandOptionType,
  CommandInteraction,
  GuildMember,
} from 'discord.js';
import { RelicCollection } from '../structures';
import { Command } from '../types';
import { DATABASE_ERROR, INVALID_RELIC } from '../util/sharedMessages';
import { getTierMetadata } from '../util/relics';

export class Track extends Command {
  name = 'track';
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
    const author = interaction.member as GuildMember;
    const tierId = interaction.options.getInteger('tier') as number;
    const relicId = interaction.options.getInteger('number') as number;

    const amountInTier = getTierMetadata(tierId)?.length;

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ embeds: [INVALID_RELIC], ephemeral: true });
      return;
    }

    const collection: RelicCollection = await this.bot.db.getCollectionById(
      author.id
    );

    if (collection.hasRelic(tierId, relicId)) {
      interaction.reply({
        embeds: [
          collection.generateEmbed(
            `You are already tracking relic T${tierId}-${relicId}.`
          ),
        ],
        ephemeral: true,
      });
      return;
    }

    try {
      await collection.addRelic(tierId, relicId);

      interaction.reply({
        embeds: [
          collection.generateEmbed(`Tracking relic T${tierId}-${relicId}`),
        ],
        ephemeral: true,
      });
    } catch (err) {
      console.error(err, collection);

      interaction.reply({
        content: DATABASE_ERROR,
        ephemeral: true,
      });
    }
  }
}

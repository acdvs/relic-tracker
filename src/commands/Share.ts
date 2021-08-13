import {
  ApplicationCommandOptionType,
  CommandInteraction,
  MessageEmbed,
} from 'discord.js';
import { Command } from '../types';
import { INVALID_RELIC } from '../util/sharedMessages';
import { getRelicMetadata, getTierMetadata } from '../util/relics';
import { RelicCollection } from '../structures';
import baseEmbedProps from '../util/baseEmbedProps';

export class Share extends Command {
  name = 'share';
  description =
    'Provide the sharecode for a relic you found that others might need.';
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
    {
      type: 'STRING' as ApplicationCommandOptionType,
      name: 'sharecode',
      description: 'Sharecode for a temple that has this relic',
      required: true,
    },
  ];

  async execute(interaction: CommandInteraction): Promise<void> {
    const tierId = interaction.options.getInteger('tier') as number;
    const relicId = interaction.options.getInteger('number') as number;
    const sharecode = interaction.options.getString('sharecode') as string;

    const amountInTier = getTierMetadata(tierId)?.length;

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ embeds: [INVALID_RELIC], ephemeral: true });
      return;
    }

    const relicMetadata = getRelicMetadata(tierId, relicId);
    const collections: RelicCollection[] =
      await this.bot.db.getCollectionsWithRelic(tierId, relicId);

    interaction.reply({
      ...(collections?.length > 0 && {
        content: collections.map((x) => `<@!${x.memberId}>`).join(' '),
      }),
      embeds: [
        new MessageEmbed({
          ...baseEmbedProps,
          title: `T${tierId}-${relicId}, _${relicMetadata.name}_`,
          thumbnail: {
            url: relicMetadata.image,
          },
          fields: [
            {
              name: 'Sharecode',
              value: sharecode,
            },
          ],
        }),
      ],
      allowedMentions: {
        users: collections.map((x) => x.memberId as string),
      },
    });
  }
}

import {
  ApplicationCommandOptionType,
  CommandInteraction,
  MessageEmbed,
  Snowflake,
} from 'discord.js';
import { Command } from '../types';
import { INVALID_RELIC } from '../util/sharedMessages';
import { RELIC_NAMES, TIER_COUNTS } from '../util/relics';
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
    const tierId = interaction.options.getInteger('tier')!;
    const relicId = interaction.options.getInteger('number')!;
    const sharecode = interaction.options.getString('sharecode')!;
    const amountInTier = TIER_COUNTS[tierId - 1];
    const author = interaction.member;

    if (!author || !('id' in author)) {
      return;
    }

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ content: INVALID_RELIC, ephemeral: true });
      return;
    }

    const memberIds: Snowflake[] = await this.bot.db.getCollectionsWithRelic(
      tierId,
      relicId
    );

    const relicName = RELIC_NAMES[tierId - 1][relicId - 1];
    const embed = new MessageEmbed({
      ...baseEmbedProps,
      title: `T${tierId}-${relicId}, ${relicName}`,
      fields: [
        {
          name: 'Sharecode',
          value: sharecode,
        },
      ],
    });

    if (memberIds?.length > 0) {
      embed.addFields({
        name: 'Relic tracked by',
        value: memberIds.map((x) => `<@!${x}>`).join(' '),
      });
    }

    interaction.reply({
      embeds: [embed],
      allowedMentions: {
        users: memberIds,
      },
    });
  }
}

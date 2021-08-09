import {
  ApplicationCommandOptionType,
  CommandInteraction,
  Snowflake,
} from 'discord.js';
import { Command } from '../types';
import { INVALID_RELIC } from '../util/sharedMessages';
import { RELIC_NAMES, TIER_COUNTS } from '../util/relics';

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
    const amountInTier = TIER_COUNTS[tierId - 1];

    if (!amountInTier || relicId < 1 || relicId > amountInTier) {
      interaction.reply({ embeds: [INVALID_RELIC], ephemeral: true });
      return;
    }

    const memberIds: Snowflake[] = await this.bot.db.getCollectionsWithRelic(
      tierId,
      relicId
    );

    const relicName = RELIC_NAMES[tierId - 1][relicId - 1];
    // eslint-disable-next-line prettier/prettier
    let message = [
      `**T${tierId}-${relicId}, ${relicName}**`,
      '```',
      sharecode
    ];

    if (memberIds?.length > 0) {
      message = message.concat([
        '```**Relic tracked by**',
        memberIds.map((x) => `<@!${x}>`).join(' '),
      ]);
    } else {
      message.push('```');
    }

    interaction.reply({
      content: message.join('\n'),
      allowedMentions: {
        users: memberIds,
      },
    });
  }
}

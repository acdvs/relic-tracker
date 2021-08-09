import { UpdateResult } from 'mongodb';
import { MessageEmbed, Snowflake } from 'discord.js';
import { PossibleUndef, RawCollectionData } from '../types';
import { Bot, RelicTier } from '.';
import baseEmbedProps from '../util/baseEmbedProps';

export default class RelicCollection {
  private static readonly MAX_TIERS = 3;
  private _bot: PossibleUndef<Bot>;

  public memberId: PossibleUndef<Snowflake>;
  public tiers: RelicTier[];

  constructor();
  constructor(tiers: RawCollectionData, memberId?: Snowflake);
  constructor(tiers: RawCollectionData, memberId: Snowflake, bot: Bot);
  constructor(tiers?: RawCollectionData, memberId?: Snowflake, bot?: Bot) {
    this._bot = bot;
    this.memberId = memberId;
    this.tiers = this._init(tiers);
  }

  private _init(tiers?: RawCollectionData): RelicTier[] {
    return (
      tiers?.map((t, i) => new RelicTier(this, i + 1, t)) ||
      Array(...Array(RelicCollection.MAX_TIERS)).map(
        (v) => new RelicTier(this, v, [])
      )
    );
  }

  async addRelic(
    tierId: number,
    relicId: number
  ): Promise<PossibleUndef<UpdateResult>> {
    const tier = this.getTier(tierId);

    if (tier && this._bot) {
      tier.addRelic(relicId);
      const result = await this._bot.db.setCollection(this);
      return result;
    }
  }

  async removeRelic(
    tierId: number,
    relicId: number
  ): Promise<PossibleUndef<UpdateResult>> {
    const tier = this.getTier(tierId);

    if (tier && this._bot) {
      tier.removeRelic(relicId);
      const result = await this._bot.db.setCollection(this);
      return result;
    }
  }

  hasRelic(tierId: number, relicId: number): boolean {
    const tier = this.getTier(tierId);
    return tier?.relics.some((r) => r.id === relicId) || false;
  }

  getTier(tierId: number): PossibleUndef<RelicTier> {
    return this.tiers[tierId - 1];
  }

  generateEmbed(title: string): MessageEmbed {
    const embed = new MessageEmbed({
      ...baseEmbedProps,
    });

    if (this.isEmpty()) {
      embed.setDescription('You are not tracking any relics yet.');
      return embed;
    }

    embed.setTitle(title);
    const descriptionLines: string[] = [];

    for (const tier of this.tiers) {
      if (!tier.isEmpty()) {
        descriptionLines.push(
          `**Tier ${tier.id}:** ${tier.getFormattedList({
            separator: ' ',
            code: true,
          })}`
        );
      }
    }

    embed.setDescription(descriptionLines.join('\n'));
    return embed;
  }

  isEmpty(): boolean {
    return this.tiers.every((tier) => tier.isEmpty());
  }

  serialize(): RawCollectionData {
    return this.tiers.reduce(
      (collection: RawCollectionData, tier: RelicTier) => {
        collection.push(tier.serialize());
        return collection;
      },
      []
    );
  }
}

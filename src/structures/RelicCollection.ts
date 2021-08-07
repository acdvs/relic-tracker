import { UpdateResult } from 'mongodb';
import { Snowflake } from 'discord.js';
import { PossibleUndef, RawCollectionData } from '../types';
import { Bot, RelicTier } from '.';

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

  getFormattedList(heading?: string): PossibleUndef<string> {
    if (this.isEmpty()) {
      return;
    }

    const lines = heading ? [`**${heading}**`] : [];

    for (const tier of this.tiers) {
      if (!tier.isEmpty()) {
        lines.push(`**Tier ${tier.id}:** \`${tier.getFormattedList()}\``);
      }
    }

    return lines.join('\n');
  }

  isEmpty(): boolean {
    return this.tiers.every((tier) => tier.relics.length === 0);
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

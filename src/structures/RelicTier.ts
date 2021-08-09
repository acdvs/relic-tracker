import { RawTierData, TierFormattedListOptions } from '../types';
import { Relic, RelicCollection } from '.';

export default class RelicTier {
  public relics: Relic[];

  constructor(
    public collection: RelicCollection,
    public readonly id: number,
    relicIds?: number[]
  ) {
    this.relics = this._init(relicIds);
  }

  private _init(relicIds?: number[]): Relic[] {
    return relicIds?.map((id) => new Relic(this, id)) || [];
  }

  addRelic(id: number): void {
    this.relics.push(new Relic(this, id));
  }

  removeRelic(id: number): void {
    const relicIdx = this.relics.findIndex((relic) => relic.id === id);
    this.relics.splice(relicIdx, 1);
  }

  isEmpty(): boolean {
    return this.relics.length === 0;
  }

  getFormattedList(opts: TierFormattedListOptions): string {
    if (this.isEmpty()) {
      return '';
    }

    return this.relics
      .map((r) => {
        const relicStr = `T${r.tier.id}-${r.id}`;
        return opts.code ? `\`${relicStr}\`` : relicStr;
      })
      .join(opts.separator);
  }

  serialize(): RawTierData {
    return this.relics.map((relic) => relic.id);
  }
}

import { RelicCollection } from '../structures';
import { RelicMetadata } from '../types';
import relicMetadata from './relicMetadata';

export const allRelics = new RelicCollection(
  relicMetadata.map((tier) => Array(...Array(tier.length)).map((v, i) => i + 1))
);

export function getTierMetadata(tierId: number): RelicMetadata[] {
  return relicMetadata[tierId - 1];
}

export function getRelicMetadata(
  tierId: number,
  relicId: number
): RelicMetadata {
  return getTierMetadata(tierId)[relicId - 1];
}

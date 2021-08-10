import { ApplicationCommandData, CommandInteraction } from 'discord.js';
import { Bot } from './structures';

export abstract class Command implements ApplicationCommandData {
  constructor(
    protected bot: Bot,
    public name: string,
    public description: string
  ) {}
  abstract execute(interaction: CommandInteraction): void;
}

export type PossibleUndef<T> = T | undefined;

export type RawTierData = number[];
export type RawCollectionData = RawTierData[];

export type TierFormattedListOptions = {
  separator: string;
  code: boolean;
};

export type RelicMetadata = {
  name: string;
  image: string;
};

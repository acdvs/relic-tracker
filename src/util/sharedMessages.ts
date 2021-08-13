import { allRelics } from './relics';

export const INVALID_RELIC = allRelics.generateEmbed({
  title: "That relic doesn't exist",
  descriptionHeader: '__**Valid relics**__',
});
export const DATABASE_ERROR = 'Something went wrong. Please try again later.';

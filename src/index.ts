import 'dotenv/config';
import Bot from './structures/Bot';

const RelicTracker = new Bot({
  retryLimit: 3,
  presence: {
    activities: [
      {
        type: 'WATCHING',
        name: 'for relics',
      },
    ],
  },
  intents: [],
});

RelicTracker.start(process.env.BOT_TOKEN!);

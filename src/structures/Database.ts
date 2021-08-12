import { Snowflake } from 'discord.js';
import { Collection, MongoClient, UpdateResult } from 'mongodb';
import { Bot, RelicCollection } from '.';
import { PossibleUndef } from '../types';

export default class Database {
  private _client: MongoClient;
  private _collection: PossibleUndef<Collection>;

  public bot: Bot;

  constructor(bot: Bot) {
    this._client = new MongoClient(process.env.MONGO_URL as string);
    this.bot = bot;
  }

  async connect(): Promise<void> {
    try {
      await this._client.connect();

      const database = this._client.db(process.env.MONGO_DB as string);
      this._collection = database.collection(
        process.env.MONGO_COLLECTION as string
      );

      console.log(
        `Connected to database ${process.env.MONGO_DB}, collection ${process.env.MONGO_COLLECTION}`
      );
    } catch (e) {
      console.error('DATABASE_CONNECT_ERRROR:', e);
      process.exit(1);
    }
  }

  disconnect(): void {
    this._client.close();
  }

  async getCollectionById(memberId: Snowflake): Promise<RelicCollection> {
    const result = await this._collection!.findOne({
      memberId: memberId,
    });

    return new RelicCollection(result?.relics, memberId, this.bot);
  }

  async getCollectionsWithRelic(
    tierId: number,
    relicId: number
  ): Promise<RelicCollection[]> {
    const result = await this._collection!.find(
      {
        [`relics.${tierId - 1}`]: {
          $elemMatch: { $eq: relicId },
        },
      },
      { projection: { _id: 0 } }
    );

    return result
      .map((x) => new RelicCollection(x.relics, x.memberId, this.bot))
      .toArray();
  }

  async setCollection(collection: RelicCollection): Promise<UpdateResult> {
    const result = await this._collection!.updateOne(
      { memberId: collection.memberId },
      { $set: { relics: collection.serialize() } },
      { upsert: true }
    );

    if (!result.acknowledged) {
      throw new Error('SET_COLLECTION_ERROR');
    }

    return result as UpdateResult;
  }

  async removeRelic(
    memberId: Snowflake,
    tierId: number,
    relicId: number
  ): Promise<void> {
    const result = await this._collection!.updateOne(
      { memberId },
      {
        $pull: {
          [`relics.${tierId - 1}`]: {
            $eq: relicId,
          },
        },
      }
    );

    if (!result.acknowledged) {
      throw new Error('REMOVE_RELIC_ERROR');
    }
  }
}

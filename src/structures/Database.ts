import { Snowflake } from 'discord.js';
import { Collection, MongoClient, UpdateResult } from 'mongodb';
import { Bot, RelicCollection } from '.';
import { PossibleUndef } from '../types';

export default class Database {
  private readonly _url = process.env.DB_URL;
  private _client: MongoClient;
  private _collection: PossibleUndef<Collection>;

  constructor(public bot: Bot) {
    this._client = new MongoClient(this._url!);
  }

  async connect(): Promise<void> {
    try {
      await this._client.connect();

      const database = this._client.db('relic_tracker');
      this._collection = database.collection('relics');
    } catch (e) {
      console.error(e);
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

    return result as UpdateResult;
  }

  async removeRelic(
    memberId: Snowflake,
    tierId: number,
    relicId: number
  ): Promise<void> {
    await this._collection!.updateOne(
      { memberId },
      {
        $pull: {
          [`relics.${tierId - 1}`]: {
            $eq: relicId,
          },
        },
      }
    );
  }
}

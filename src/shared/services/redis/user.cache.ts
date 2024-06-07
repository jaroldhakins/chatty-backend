import { BaseCache } from '@service/redis/base.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import Logger from 'bunyan';
import { config } from '@root/config';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';

const log: Logger = config.createLogger('userCache');

export class UserCache extends BaseCache {
  constructor () {
    super('userCache');
  }

  public async saveUserToCache(key: string, userUId: string, createdUser: IUserDocument): Promise<void> {
    const createdAt = new Date();
    const {
      _id,
      uId,
      username,
      email,
    } = createdUser;

    const firstList: string[] = [
      '_id', `${_id}`,
      'uId', `${uId}`,
      'username', `${username}`,
      'email', `${email}`,
      'createdAt', `${createdAt}`
    ];

    const dataToSave: string[] = [...firstList];

    try {
      if(!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.ZADD('user', {score: parseInt(userUId, 10), value: `${key}`});
      await this.client.HSET(`users:${key}`, dataToSave);
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error try again.');
    }
  }

  public async getUserFromCache(userId: string): Promise<IUserDocument | null> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: IUserDocument = (await this.client.HGETALL(`users:${userId}`)) as unknown as IUserDocument;
      // All the properties that have been sttingyfied or aren't strings
      response.createdAt = new Date(Helpers.parseJson(`${response.createdAt}`));
      // response.postsCount = Helpers.parseJson(`${response.postsCount}`);
      return response;
    } catch (error) {
      log.error(error);
      throw new ServerError('Server error try again.');
    }
  }
}

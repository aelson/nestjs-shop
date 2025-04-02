import { Types } from 'mongoose';

export class MongoHelper {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }
}

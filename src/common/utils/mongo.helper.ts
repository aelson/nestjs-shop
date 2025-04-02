import { Types } from 'mongoose';

export class MongoHelper {
  static isValidObjectId(id: string): boolean {
    return Types.ObjectId.isValid(id);
  }

  static createObjectId(id: string): Types.ObjectId {
    return new Types.ObjectId(id);
  }

  /**
   * Safely converts a string to ObjectId or returns null if invalid
   */
  static toObjectId(id: string): Types.ObjectId | null {
    try {
      return this.isValidObjectId(id) ? new Types.ObjectId(id) : null;
    } catch {
      return null;
    }
  }
}

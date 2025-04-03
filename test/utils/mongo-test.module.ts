import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

export const MongoTestModule = MongooseModule.forRootAsync({
  useFactory: async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    return {
      uri,
    };
  },
});

export const closeMongoConnection = async () => {
  if (mongod) await mongod.stop();
};

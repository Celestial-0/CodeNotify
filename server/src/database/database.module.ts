import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { DATABASE, getDatabaseName } from '../common/constants';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('DatabaseModule');

        // Get environment variables from ConfigService (runtime)
        const nodeEnv = configService.get<string>('NODE_ENV', 'dev');
        const baseDbName = configService.get<string>('DB_NAME', 'codenotify');

        // Get database name using centralized logic from constants
        const dbName = getDatabaseName(nodeEnv, baseDbName);

        const uri =
          configService.get<string>('MONGO_URI') ||
          DATABASE.MONGO_URI ||
          'mongodb://localhost:27017';

        logger.log(`Connecting to MongoDB...`);
        logger.log(`Environment: ${nodeEnv}`);
        logger.log(`Database: ${dbName}`);

        return {
          uri,
          dbName,
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB connected successfully');
            });

            connection.on('error', (error: Error) => {
              logger.error('MongoDB connection error', error.stack);
            });

            connection.on('disconnected', () => {
              logger.warn('MongoDB disconnected');
            });

            // Log immediate connection state
            if (connection.readyState === 1) {
              logger.log('MongoDB connected successfully');
            }

            return connection;
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

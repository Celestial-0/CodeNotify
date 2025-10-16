import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const DB_NAME = 'codenotify';
        const logger = new Logger('DatabaseModule');
        const uri = configService.get<string>('MONGO_URI') + '/' + DB_NAME;

        logger.log('Connecting to MongoDB...');

        return {
          uri,
          connectionFactory: (connection) => {
            connection.on('connected', () => {
              logger.log('MongoDB connected successfully');
            });

            connection.on('error', (error) => {
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

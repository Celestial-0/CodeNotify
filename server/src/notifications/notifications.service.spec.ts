import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotificationsService } from './notifications.service';
import { User } from '../users/schemas/user.schema';
import { Contest } from '../contests/schemas/contest.schema';
import { Notification } from './schemas/notification.schema';
import { EmailNotificationService } from './services/email-notification.service';
import { WhatsAppNotificationService } from './services/whatsapp-notification.service';
import { PushNotificationService } from './services/push-notification.service';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEmailService = {
    send: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(false),
    healthCheck: jest.fn(),
  };

  const mockWhatsAppService = {
    send: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(false),
    healthCheck: jest.fn(),
  };

  const mockPushService = {
    send: jest.fn(),
    isEnabled: jest.fn().mockReturnValue(false),
    healthCheck: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Contest.name),
          useValue: mockModel,
        },
        {
          provide: getModelToken(Notification.name),
          useValue: mockModel,
        },
        {
          provide: EmailNotificationService,
          useValue: mockEmailService,
        },
        {
          provide: WhatsAppNotificationService,
          useValue: mockWhatsAppService,
        },
        {
          provide: PushNotificationService,
          useValue: mockPushService,
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

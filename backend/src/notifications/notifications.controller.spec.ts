import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailNotificationService } from './services/email-notification.service';
import { WhatsAppNotificationService } from './services/whatsapp-notification.service';
import { PushNotificationService } from './services/push-notification.service';
import { AdminEmailService } from './services/admin-email.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockNotificationsService = {
    sendNotification: jest.fn(),
    getNotifications: jest.fn(),
    markAsRead: jest.fn(),
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

  const mockAdminEmailService = {
    sendCustomEmail: jest.fn(),
    sendBulkEmail: jest.fn(),
    sendAnnouncement: jest.fn(),
    sendContestReminder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
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
        {
          provide: AdminEmailService,
          useValue: mockAdminEmailService,
        },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

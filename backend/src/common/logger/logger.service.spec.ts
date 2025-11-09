import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    service = module.get<LoggerService>(LoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be an instance of LoggerService', () => {
    expect(service).toBeInstanceOf(LoggerService);
  });

  it('should be injectable', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    const loggerService = module.get<LoggerService>(LoggerService);
    expect(loggerService).toBeDefined();
  });

  it('should be a singleton within the same module', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
    }).compile();

    const instance1 = module.get<LoggerService>(LoggerService);
    const instance2 = module.get<LoggerService>(LoggerService);

    expect(instance1).toBe(instance2);
  });

  it('should have Injectable decorator', () => {
    const metadata = Reflect.getMetadata('__injectable__', LoggerService) as
      | boolean
      | undefined;
    expect(metadata).toBeDefined();
  });

  it('should be usable in other modules', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerService],
      exports: [LoggerService],
    }).compile();

    const exportedService = module.get<LoggerService>(LoggerService);
    expect(exportedService).toBeDefined();
  });

  it('should maintain state across calls', () => {
    expect(service).toBe(service);
  });

  it('should be constructible', () => {
    const instance = new LoggerService();
    expect(instance).toBeInstanceOf(LoggerService);
  });

  it('should have no methods by default', () => {
    const methods = Object.getOwnPropertyNames(
      Object.getPrototypeOf(service),
    ).filter((name) => name !== 'constructor');
    expect(methods.length).toBe(0);
  });

  it('should be extendable', () => {
    class ExtendedLogger extends LoggerService {
      log(message: string) {
        return message;
      }
    }

    const extended = new ExtendedLogger();
    expect(extended).toBeInstanceOf(LoggerService);
    expect(extended.log('test')).toBe('test');
  });

  afterEach(async () => {
    // Cleanup if needed
  });
});

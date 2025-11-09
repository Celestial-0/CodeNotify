import { Test, TestingModule } from '@nestjs/testing';
import { CommonModule } from './common.module';

describe('CommonModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile successfully', () => {
    expect(module).toBeInstanceOf(TestingModule);
  });

  it('should be a valid NestJS module', () => {
    expect(module).toBeDefined();
    expect(module).toBeInstanceOf(TestingModule);
  });

  it('should have no providers by default', () => {
    const providers =
      (Reflect.getMetadata('providers', CommonModule) as unknown[]) || [];
    expect(Array.isArray(providers)).toBe(true);
    expect(providers.length).toBe(0);
  });

  it('should have no controllers by default', () => {
    const controllers =
      (Reflect.getMetadata('controllers', CommonModule) as unknown[]) || [];
    expect(Array.isArray(controllers)).toBe(true);
    expect(controllers.length).toBe(0);
  });

  it('should have no imports by default', () => {
    const imports =
      (Reflect.getMetadata('imports', CommonModule) as unknown[]) || [];
    expect(Array.isArray(imports)).toBe(true);
    expect(imports.length).toBe(0);
  });

  it('should have no exports by default', () => {
    const exports =
      (Reflect.getMetadata('exports', CommonModule) as unknown[]) || [];
    expect(Array.isArray(exports)).toBe(true);
    expect(exports.length).toBe(0);
  });

  it('should be importable in other modules', async () => {
    const testModule = await Test.createTestingModule({
      imports: [CommonModule],
    }).compile();

    expect(testModule).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
});

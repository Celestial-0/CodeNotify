import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class EnumValidationPipe<
  T extends Record<string, string>,
> implements PipeTransform {
  constructor(
    private readonly enumType: T,
    private readonly enumName: string,
  ) {}

  transform(value: string): string {
    const enumValues = Object.values(this.enumType);
    if (!enumValues.includes(value)) {
      throw new BadRequestException(
        `Invalid ${this.enumName}. Must be one of: ${enumValues.join(', ')}`,
      );
    }
    return value;
  }
}

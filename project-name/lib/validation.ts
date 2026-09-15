import { BadRequestException } from '@nestjs/common';

export function requireUuid(value: unknown): asserts value is string {
  if (
    typeof value !== 'string' ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  ) {
    throw new BadRequestException('Invalid UUID');
  }
}

export function requiredText(
  value: unknown,
  field: string,
  maxLength = 10000,
): string {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.trim().length > maxLength
  ) {
    throw new BadRequestException(`Invalid ${field}`);
  }
  return value.trim();
}

export function optionalText(
  value: unknown,
  field: string,
  maxLength = 10000,
): string | null {
  if (value == null || value === '') return null;
  return requiredText(value, field, maxLength);
}

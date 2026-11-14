import type { ValidationError } from 'class-validator';

function flattenError(
  error: ValidationError,
  parentPath: string,
  output: string[],
): void {
  const path = parentPath ? `${parentPath}.${error.property}` : error.property;

  if (error.constraints) {
    for (const message of Object.values(error.constraints)) {
      output.push(`${path}: ${message}`);
    }
  }

  if (error.children && error.children.length > 0) {
    for (const child of error.children) {
      flattenError(child, path, output);
    }
  }
}

/**
 * Converts class-validator errors into a flat list of readable messages.
 */
export function flattenValidationErrors(errors: ValidationError[]): string[] {
  const messages: string[] = [];

  for (const error of errors) {
    flattenError(error, '', messages);
  }

  return messages;
}

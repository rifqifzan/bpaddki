import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route as accessible without an API key.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

import { SetMetadata } from '@nestjs/common';
export const PERMISSIONS_KEY = 'required_permissions';
/** AND entre grupos; OR dentro de cada grupo. */
export const RequirePermissions = (...groups: (string | string[])[]) =>
  SetMetadata(PERMISSIONS_KEY, groups);
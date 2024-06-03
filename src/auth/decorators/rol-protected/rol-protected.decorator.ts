import { SetMetadata } from '@nestjs/common';
import { VALID_ROLES } from 'src/auth/interfaces/valid-roles.interface';

export const META_ROLES = 'roles'
export const RolProtected = (...args: VALID_ROLES[]) => {

  return  SetMetadata(META_ROLES, args);
}

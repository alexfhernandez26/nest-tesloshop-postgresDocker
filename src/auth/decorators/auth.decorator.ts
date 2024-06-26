import { UseGuards, applyDecorators } from '@nestjs/common';
import { VALID_ROLES } from '../interfaces/valid-roles.interface';
import { RolProtected } from './rol-protected/rol-protected.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

export function Auth(...roles: VALID_ROLES[]) {
  return applyDecorators(
    RolProtected(...roles),
    UseGuards(AuthGuard(),UserRoleGuard),
  );
}
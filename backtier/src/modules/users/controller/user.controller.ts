import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtClaimsGuard } from '../../../core/auth/guard/jwt-claims.guard';
import { TenantAccessGuard } from '../../../core/auth/guard/tenant-access.guard';
import {
  CreateSubUserDto,
  CreateUserDto,
  UpdateSubUserDto,
  UpdateUserDto,
} from '../dto/user.dto';
import { UserService } from '../service/user.service';
import { RolesGuard } from '../../../core/auth/guard/roles.guard';
import { Roles } from '../../../core/auth/decorators/roles.decorator';
import { UserRole } from '../../../core/types/user-role.enum';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtClaimsGuard, TenantAccessGuard, RolesGuard)
@Controller('tenants/:tenantId/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users (excludes superadmin)' })
  getUsers(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.userService.getUsers(tenantId);
  }

  @Get('platform-users')
  @ApiOperation({
    summary:
      'Get platform users (admin/adminusers/tenantadmin/tenantadmin_subusers) for SuperAdmin Users page',
  })
  getPlatformUsers(@Param('tenantId', new ParseUUIDPipe()) tenantId: string) {
    return this.userService.getPlatformUsers(tenantId);
  }

  @Get('tenant-users')
  @ApiOperation({
    summary:
      'Get tenant-scoped users (tenantadmin/tenantadmin_subusers) for Tenant Sub Users page',
  })
  getTenantScopedUsers(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
  ) {
    return this.userService.getTenantScopedUsers(tenantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUserById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.getUserById(tenantId, id);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create user (Admin Only)' })
  createUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Body() body: CreateUserDto,
  ) {
    return this.userService.createUser(tenantId, body);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update user (Admin Only)' })
  updateUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateUser(tenantId, id, body);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete user (Admin Only)' })
  deleteUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.deleteUser(tenantId, id);
  }

  @Get(':userId/sub-users')
  @ApiOperation({ summary: 'Get sub-users' })
  getSubUsers(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
  ) {
    return this.userService.getSubUsers(tenantId, userId);
  }

  @Get(':userId/sub-users/:id')
  @ApiOperation({ summary: 'Get sub-user by ID' })
  getSubUserById(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.getSubUserById(tenantId, userId, id);
  }

  @Post(':userId/sub-users')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create sub-user (Admin Only)' })
  createSubUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Body() body: CreateSubUserDto,
  ) {
    return this.userService.createSubUser(tenantId, userId, body);
  }

  @Patch(':userId/sub-users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update sub-user (Admin Only)' })
  updateSubUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: UpdateSubUserDto,
  ) {
    return this.userService.updateSubUser(tenantId, userId, id, body);
  }

  @Delete(':userId/sub-users/:id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete sub-user (Admin Only)' })
  deleteSubUser(
    @Param('tenantId', new ParseUUIDPipe()) tenantId: string,
    @Param('userId', new ParseUUIDPipe()) userId: string,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.userService.deleteSubUser(tenantId, userId, id);
  }
}

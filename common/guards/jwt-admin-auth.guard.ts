import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from 'apps/admin/src/modules/auth/auth.service';
import { IS_PUBLIC_KEY } from 'common/decorators';
import { JwtUtility } from 'common/utils';
import { Request } from 'express';
@Injectable()
export class JwtAdminAuthGuard implements CanActivate {
  constructor(
    private readonly adminService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      // See this condition
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await JwtUtility.verifyToken(token);

      // check admin info
      const admin = await this.adminService.getAdminById(payload.sub);
      if (!admin) {
        throw new UnauthorizedException();
      }

      if (admin.isSuspended) {
        throw new UnauthorizedException();
      }
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      request['admin'] = admin;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

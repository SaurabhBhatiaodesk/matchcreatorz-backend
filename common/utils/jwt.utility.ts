// jwt.utility.ts
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export class JwtUtility {
  private static jwtService: JwtService;

  static init(configService: ConfigService): void {
    JwtUtility.jwtService = new JwtService({
      secret: configService.get<string>('JWT_SECRET'),
      signOptions: { expiresIn: '10h' },
    });
  }

  static generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  static verifyToken(token: string): any {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      // Handle token verification error
      return null;
    }
  }
}

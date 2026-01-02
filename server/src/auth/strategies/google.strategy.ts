import {
  Injectable,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken: string;
}

interface OAuthUserResponse {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');

    // Use placeholder values if not configured (strategy will fail at runtime if used)
    super({
      clientID: clientID || 'not-configured',
      clientSecret: clientSecret || 'not-configured',
      callbackURL: configService.get<string>(
        'GOOGLE_CALLBACK_URL',
        '/auth/google/callback',
      ),
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });

    if (!clientID || !clientSecret) {
      console.warn(
        '⚠️  Google OAuth is not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables to enable Google sign-in.',
      );
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<void> {
    try {
      const { emails, name, photos } = profile;

      if (!emails || emails.length === 0) {
        return done(
          new UnauthorizedException('No email found from Google'),
          false,
        );
      }

      const email = emails[0].value;
      const userName =
        name?.givenName && name?.familyName
          ? `${name.givenName} ${name.familyName}`
          : 'Google User';

      const picture = photos && photos.length > 0 ? photos[0].value : undefined;

      // Validate or create OAuth user

      const user = (await this.authService.validateOAuthUser(
        email,
        userName,
      )) as OAuthUserResponse;

      const googleUser: GoogleUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        picture,
        accessToken: user.accessToken,
        refreshToken: user.refreshToken,
      };

      done(null, googleUser);
    } catch (error) {
      done(error instanceof Error ? error : new Error(String(error)), false);
    }
  }
}

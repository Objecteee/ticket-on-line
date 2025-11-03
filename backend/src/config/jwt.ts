/**
 * JWT配置
 */
import { env } from './env';

export const jwtConfig = {
  secret: env.JWT_SECRET as string,
  expiresIn: env.JWT_EXPIRES_IN as string,
};


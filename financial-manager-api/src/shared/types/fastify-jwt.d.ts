import '@fastify/jwt';
import 'fastify';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { role: string };
    user: {
      sub: string;
      role: string;
      iat: number;
      exp: number;
    };
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    organizationIds: string[];
  }
}

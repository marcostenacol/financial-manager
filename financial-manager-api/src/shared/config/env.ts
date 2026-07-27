import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória').url('DATABASE_URL deve ser uma URL válida'),
  REDIS_URL: z.string().min(1, 'REDIS_URL é obrigatória').url('REDIS_URL deve ser uma URL válida'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatória'),
  JWT_EXPIRES_IN: z.string().min(1, 'JWT_EXPIRES_IN é obrigatória'),
  JWT_REFRESH_EXPIRES_IN: z.string().min(1, 'JWT_REFRESH_EXPIRES_IN é obrigatória'),
});

function validateEnv(): void {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    // eslint-disable-next-line no-console
    console.error(`Variáveis de ambiente inválidas ou ausentes:\n${issues}`);
    process.exit(1);
  }
}

validateEnv();

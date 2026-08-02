const UNIT_TO_MS: Record<string, number> = {
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(duration: string): number {
  const match = /^(\d+)(s|m|h|d)$/.exec(duration.trim());

  if (!match) {
    throw new Error(`Formato de duração inválido: "${duration}" (use algo como "15m", "1d", "7d")`);
  }

  const [, value, unit] = match;

  return Number(value) * UNIT_TO_MS[unit];
}

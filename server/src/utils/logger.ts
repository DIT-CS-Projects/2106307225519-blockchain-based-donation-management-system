// Minimal leveled logger. Can be swapped for pino later without touching callers.

type Level = 'info' | 'warn' | 'error'

function log(level: Level, ...args: unknown[]): void {
  const prefix = `[${new Date().toISOString()}] ${level.toUpperCase()}`
  if (level === 'error') console.error(prefix, ...args)
  else if (level === 'warn') console.warn(prefix, ...args)
  else console.log(prefix, ...args)
}

export const logger = {
  info: (...args: unknown[]) => log('info', ...args),
  warn: (...args: unknown[]) => log('warn', ...args),
  error: (...args: unknown[]) => log('error', ...args),
}

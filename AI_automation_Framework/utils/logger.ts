import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  base: { name: 'myaccount-ui-playwright' },
});

export function logStep(testName: string, step: string, data?: Record<string, unknown>) {
  logger.info({ testName, step, ...data }, step);
}

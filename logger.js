// logger.js
const fs = require('fs');
const path = require('path');
const { createLogger, format, transports } = require('winston');

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: 'kraken-kafka-ws-service' },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, stack }) => {
          return stack
            ? `[${timestamp}] ${level}: ${message} - ${stack}`
            : `[${timestamp}] ${level}: ${message}`;
        })
      )
    }),
    new transports.File({
      filename: path.join(logDir, 'error.log.json'),
      level: 'error', // only store errors
      format: format.combine(format.timestamp(), format.json()),
    }),
  ],
});

function logError(err, context = '') {
  if (err instanceof Error) {
    logger.error(`${context} ${err.message}`, { stack: err.stack });
  } else {
    logger.error(`${context} ${JSON.stringify(err)}`);
  }
}

module.exports = {
  logger,
  logError,
};

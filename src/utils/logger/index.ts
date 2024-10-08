import morgan from "morgan";
import { createLogger, format, transports } from "winston";
const { timestamp, json, colorize } = format;

// Custom format for console logging with colors
const consoleLogFormat = format.combine(
  format.colorize(),
  format.printf(({ level, message, timestamp }) => {
    return `${level}: ${message}`;
  })
);

const LogFormat = process.env.NODE_ENV === 'production' ? format.combine(timestamp(), json()) : format.combine(colorize(),timestamp(), json())

// Create a Winston logger
const logger = createLogger({
  level: "debug",
  format: LogFormat,
  transports: [
    new transports.Console({
      format: consoleLogFormat,
    }),
    new transports.File({ filename: "logs/app.log" }),
  ],
});

const morganFormat = ":method :url :status :response-time ms";

export function morganLogger() {
  return morgan(morganFormat, {
    stream: {
      write: (message) => {
        const logObject = {
          method: message.split(" ")[0],
          url: message.split(" ")[1],
          status: message.split(" ")[2],
          responseTime: message.split(" ")[3],
        };
        logger.info(JSON.stringify(logObject));
      },
    },
  });
}

export default logger;


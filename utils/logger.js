const { createLogger, format, transports } = require("winston");

module.exports = createLogger({
  transports: [
    new transports.File({
      filename: "logs/server.log",
      format: format.combine(
        format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    })
  ],
});
import pino from "pino"

const devTransport = {
    targets: [{
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:yyyy-mm-dd HH:MM:ss",
            ignore: "pid,hostname",
        },
    }]
}



const prodTransport = {
    targets: [
        {
            level: 'request',
            target: "pino-roll",
            options: {
                file: "./logs/request",
                frequency: "daily",
                dateFormat: 'yyyy-MM-dd',
                extension: '.log',
                mkdir: true,
                size: "10m",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss"
            }
        },
        {
            level: 'error',
            target: "pino-roll",
            options: {
                file: "./logs/error",
                frequency: "daily",
                dateFormat: 'yyyy-MM-dd',
                extension: '.log',
                mkdir: true,
                size: "10m",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss"
            }
        },
        {
            level: 'info', // logs info, warn, etc. (but NOT error)
            target: "pino-roll",
            options: {
                file: "./logs/app",
                frequency: "daily",
                dateFormat: 'yyyy-MM-dd',
                extension: '.log',
                mkdir: true,
                size: "10m",
                translateTime: "SYS:yyyy-mm-dd HH:MM:ss"
            }
        }

    ]
};


const transport = prodTransport


const logger = pino({

    level: process.env.LOG_LEVEL || "info",
    transport: transport,
    customLevels: {
        request: 15,
    },
    timestamp: pino.stdTimeFunctions.isoTime
})

export default logger

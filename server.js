require('dotenv').config();
const { Kafka } = require('kafkajs');
const WebSocket = require('ws');
const { logger, logError } = require('./logger');

const {
  KAFKA_BROKER,
  KAFKA_TOPIC,
  WS_PORT,
} = process.env;

const kafka = new Kafka({
  clientId: 'kraken-consumer',
  brokers: [KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'kraken-group' });

const wss = new WebSocket.Server({ port: parseInt(WS_PORT, 10) || 8080 });

wss.on('connection', (ws) => {
  logger.info('Client connected');

  ws.on('close', () => {
    logger.info('Client disconnected');
  });

  ws.on('error', (err) => {
    logError(err, 'WebSocket error:');
  });
});

async function runConsumer() {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: KAFKA_TOPIC, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ message }) => {
        const msgValue = message.value.toString();
        logger.info(`Received from Kafka: ${msgValue}`);

        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(msgValue);
          }
        });
      },
    });
  } catch (err) {
    logError(err, 'Consumer error:');
    process.exit(1);
  }
}

runConsumer();

logger.info(`WebSocket server started on ws://localhost:${WS_PORT || 8080}`);

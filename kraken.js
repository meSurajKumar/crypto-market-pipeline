require('dotenv').config();
const { Kafka, Partitioners } = require('kafkajs');
const WebSocket = require('ws');
const { logger, logError } = require('./logger');

const {
  KAFKA_BROKER,
  KAFKA_TOPIC,
  KRAKEN_WS_URL,
  SYMBOLS,
} = process.env;

const kafka = new Kafka({
  clientId: 'kraken-producer',
  brokers: [KAFKA_BROKER],
});

const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

async function connectToKraken() {
  const ws = new WebSocket(KRAKEN_WS_URL);

  ws.on('open', () => {
    logger.info('Connected to Kraken WebSocket');
    const subscribeMsg = {
      event: 'subscribe',
      pair: SYMBOLS.split(','),
      subscription: { name: 'ticker' },
    };
    ws.send(JSON.stringify(subscribeMsg));
  });

  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);

      if (Array.isArray(message)) {
        const [, tickerData, , pair] = message;

        const symbol = pair.replace('/', '');
        const timestamp = new Date().toISOString();
        const bid = parseFloat(tickerData.b[0]);
        const ask = parseFloat(tickerData.a[0]);

        const kafkaMessage = { symbol, timestamp, bid, ask };

        logger.info(`Producing message to Kafka: ${JSON.stringify(kafkaMessage)}`);

        await producer.send({
          topic: KAFKA_TOPIC,
          messages: [{ value: JSON.stringify(kafkaMessage) }],
        });
      }
    } catch (err) {
      logError(err, 'Error processing WebSocket message:');
    }
  });

  ws.on('error', (err) => {
    logError(err, 'WebSocket error:');
  });

  ws.on('close', (code, reason) => {
    logger.warn(`WebSocket closed. Code: ${code}, Reason: ${reason}`);
    // Retry connection after 5 seconds
    setTimeout(connectToKraken, 5000);
  });
}

async function runProducer() {
  try {
    await producer.connect();
    logger.info('Kafka producer connected');
    connectToKraken();
  } catch (err) {
    logError(err, 'Producer error:');
    process.exit(1);
  }
}

runProducer();

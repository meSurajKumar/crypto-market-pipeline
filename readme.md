# 📊 Real-Time Market Data Pipeline — Node.js + Kafka + WebSocket

This project simulates a real-time trading data pipeline that connects to the Kraken WebSocket API, ingests crypto ticker updates, forwards them to a Kafka topic, and streams them to all connected WebSocket clients.

---

## 🚀 Features

- Connects to Kraken WebSocket API (`wss://ws.kraken.com`)
- Subscribes to BTC/USD and ETH/USD ticker updates
- Forwards each update to a Kafka topic (`quotes.crypto`)
- Kafka consumer reads messages and broadcasts via WebSocket
- WebSocket server on `ws://localhost:8080`
- Centralized logging and error handling with `winston`
- Error logs saved to `logs/error.log.json`

---

## 🧩 Tech Stack

- Node.js (JavaScript)
- Kafka (Local setup)
- KafkaJS
- ws (WebSocket library)
- winston (Logger)

---

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd real-time-market-pipeline
```

### 2. Install Dependencies
```
npm install
```

## Make sure Kafka and Zookeeper are installed and running locally
```
Download and install Kafka
Go to the official Apache Kafka website: https://kafka.apache.org/downloads

Download the latest Kafka binary (e.g., kafka_2.13-3.5.1.tgz)

Extract the archive somewhere on your machine
```

### Start Zookeeper
```
- For Windows
 .\bin\windows\zookeeper-server-start.bat .\config\zookeeper.properties

- For linux (ubantu)
 bin/zookeeper-server-start.sh config/zookeeper.properties
```
### Start Kafka Broker
```
Windows :- 
 .\bin\windows\kafka-server-start.bat .\config\server.properties

For Ubantu and Linux :- 
 bin/kafka-server-start.sh config/server.properties

```

## Create Kafka topic
```
bin/kafka-topics.sh --create --topic quotes.crypto --bootstrap-server localhost:9092 --partitions 1 --replication-factor 1
```

## Configure Environment Variables (Optional)
### Create a .env file: And Paste the Below Values
```

KAFKA_BROKER=localhost:9092
KAFKA_TOPIC=quotes.crypto
WS_PORT=8080
KRAKEN_WS_URL=wss://ws.kraken.com
SYMBOLS=BTC/USD,ETH/USD

```

## Run the Services
### Start the server :
```
node server.js
```

## Now After the Server start the kraken.js
```
node kraken.js
```


## 🔎 Expected Kafka Message Format
```
{
  "symbol": "BTCUSD",
  "timestamp": "2025-05-16T12:00:01.123Z",
  "bid": 64350.55,
  "ask": 64360.10
}

```
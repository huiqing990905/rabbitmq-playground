# RabbitMQ Playground

An interactive web app that visualizes how RabbitMQ routes messages through different exchange types. Send a message, see it flow through the system in real time.

**[Live Demo](https://rabbitmq.hqinglab.tech)** | **[Source Code](https://github.com/huiqing990905/rabbitmq-playground)**

## What It Does

Pick an exchange type, choose a routing key, send a message, and watch:

- **Before sending** — the UI predicts which queues will match (blue highlight)
- **After sending** — real RabbitMQ consumers process the message and confirm delivery via WebSocket (green highlight)
- **Each route** shows WHY it matched or didn't (pattern explanation)

### Exchange Types Demonstrated

| Type | Routing Rule | Example |
|------|-------------|---------|
| **Default** | routing key = queue name | `ping-queue` → ping-queue |
| **Direct** | Exact match | `action.attack` → attack-queue, `action.fly` → dropped! |
| **Topic** | Wildcard (`*` = one word, `#` = any) | `player.critical` → matches `*.critical`, `player.*`, and `#` |
| **Fanout** | Broadcast to all | All 3 queues receive every message |

## Architecture

```
┌──────────────┐     REST + WebSocket     ┌──────────────────┐      AMQP       ┌──────────────┐
│   Frontend   │ ◄──────────────────────► │     Backend      │ ◄─────────────► │   RabbitMQ   │
│  React/Vite  │                          │  Spring Boot     │                 │  CloudAMQP   │
│   (Vercel)   │                          │    (Render)      │                 │   (Free)     │
└──────────────┘                          └──────────────────┘                 └──────────────┘
```

**Message flow:**
1. User sends message via REST API → Backend publishes to RabbitMQ exchange
2. RabbitMQ routes to matching queue(s) based on exchange type + routing key
3. Backend consumers receive messages → push to frontend via WebSocket
4. Frontend animates the message flow in real time

## Tech Stack

**Backend**
- Java 21, Spring Boot 3.2
- Spring AMQP (RabbitMQ client)
- Spring WebSocket (STOMP over SockJS)

**Frontend**
- React 18, Vite
- @stomp/stompjs + SockJS (WebSocket client)
- Custom CSS (no UI framework)

**Infrastructure**
- RabbitMQ hosted on [CloudAMQP](https://www.cloudamqp.com/) (free tier)
- Backend deployed on [Render](https://render.com/) (free tier)
- Frontend deployed on [Vercel](https://vercel.com/)

## Run Locally

**Prerequisites:** Docker, Java 21, Maven, Node.js

```bash
# Start RabbitMQ
docker compose up -d

# Start backend (port 8099)
cd backend
mvn spring-boot:run

# Start frontend (port 5173)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Project Structure

```
├── backend/
│   ├── src/main/java/com/learn/rabbitmq/
│   │   ├── config/          # RabbitMQ exchanges, queues, bindings + WebSocket + CORS
│   │   ├── producer/        # REST API to send messages
│   │   ├── consumer/        # RabbitMQ listeners → WebSocket push
│   │   └── websocket/       # Real-time notification service
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/      # ExchangeSelector, FlowDiagram, MessageForm, ConsumerLog
│   │   ├── hooks/           # WebSocket connection management
│   │   └── utils/           # Routing key match prediction logic
│   └── package.json
└── docker-compose.yml       # Local RabbitMQ
```

## What I Learned

- How RabbitMQ's 4 exchange types differ in routing behavior
- Producer → Exchange → Binding → Queue → Consumer message flow
- WebSocket (STOMP) for real-time server-to-client push
- Deploying a full-stack app on free-tier cloud services

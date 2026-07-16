# Narada Messenger

**Narada Messenger** is a full-stack emergency communication platform designed to demonstrate how messages and SOS alerts could be routed when conventional internet and cellular infrastructure becomes unavailable.

The current website is a hackathon simulation of a decentralized **store-carry-forward network**, where devices act as temporary relay nodes and forward encrypted packets toward the receiver or an authority network.

## Core Features

* User registration and unique Narada IDs
* JWT-based authentication
* Real-time messaging with Socket.IO
* MongoDB message persistence
* Multi-hop relay simulation
* Packet status tracking
* Emergency SOS creation and routing
* Authority incident dashboard
* Response-team assignment and incident resolution
* Network map and routing simulator
* Packet inspector
* Network analytics
* Disaster simulation mode
* Real-time notification system

## Tech Stack

### Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* Lucide React

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Socket.IO
* JWT Authentication

## Project Architecture

```text
User Device
    ↓
Relay Node 1
    ↓
Relay Node 2
    ↓
Receiver / Authority Network
```

Messages and emergency packets move through simulated relay nodes while their route, status, hops, and delivery progress are displayed in real time.

## Local Setup

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/narada-messenger.git
cd narada-messenger
```

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_PRIVATE_JWT_SECRET
JWT_EXPIRES_IN=7d
```

Create the frontend `.env` in the main project folder:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run the backend:

```bash
cd server
npm run dev
```

Run the frontend in another terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Important Note

The current implementation uses Express, MongoDB, and Socket.IO to simulate decentralized routing inside a web browser.

It does **not currently use Bluetooth or Wi-Fi Direct**. A production version could replace the simulation transport layer with technologies such as:

* Bluetooth Low Energy
* Wi-Fi Direct
* Google Nearby Connections
* Native Android peer discovery
* Delay-tolerant store-carry-forward networking

## Use Case

Narada Messenger is intended for situations such as:

* Natural disasters
* Cellular-network outages
* Infrastructure failures
* Remote-area communication
* Emergency evacuation
* Search-and-rescue coordination

## Security

Environment files and credentials are excluded from Git using `.gitignore`.

Never commit:

```text
.env
server/.env
```

## Status

Narada Messenger is currently a functional hackathon MVP demonstrating resilient messaging, simulated multi-hop routing, SOS transmission, and real-time authority coordination.

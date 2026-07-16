# Narada Messenger

> A decentralized emergency communication system designed to keep messages moving even when the internet, cellular towers, and conventional communication infrastructure are unavailable.

## Core Vision

During disasters, cyberattacks, wars, blackouts, or large-scale infrastructure failures, conventional communication systems can stop working because they depend on centralized infrastructure such as:

* Mobile towers
* Internet service providers
* Cloud servers
* Wi-Fi routers
* Central databases
* Power-dependent communication stations

Narada Messenger explores a different approach:

**Every nearby device can temporarily act as a communication node.**

Instead of requiring a direct internet connection between sender and receiver, a message can move through multiple nearby devices until it reaches its destination.

```text
Sender
  ↓
Nearby Device
  ↓
Relay Device
  ↓
Another Relay Device
  ↓
Receiver
```

Each participating phone or device becomes a small temporary communication tower.

This creates a resilient, decentralized network that can continue forwarding messages even when traditional infrastructure is damaged or unavailable.

---

## Why the Name “Narada”?

In Indian mythology, Narada is known as a messenger who travels between different worlds and delivers information.

Narada Messenger follows the same idea digitally: carrying information across disconnected devices until it reaches the intended recipient.

---

# The Real Node Concept

In the proposed real-world version, every registered device acts as a network node.

A node can:

* Discover nearby devices
* Store encrypted messages temporarily
* Forward packets to other devices
* Update message-routing information
* Verify packet authenticity
* Report delivery status
* Participate without reading message contents

The system follows a **store-carry-forward** communication model.

## Store

When the sender creates a message, it is encrypted and converted into a packet.

If the receiver is not directly reachable, the sender stores the packet locally.

## Carry

The device carries the encrypted packet while the user moves.

When another Narada-enabled device comes within range, both devices exchange limited routing information.

## Forward

The message is forwarded to the nearby device that has a better chance of reaching the receiver.

This process continues until:

* The receiver is found
* An authority gateway receives the packet
* The packet expires
* The maximum hop limit is reached

---

# Example Scenario

Assume Shashank wants to send a message to Ravi during a complete network blackout.

Shashank and Ravi are not directly within Bluetooth or Wi-Fi range.

However, other Narada devices exist between them.

```text
Shashank
   ↓
Device A
   ↓
Device B
   ↓
Device C
   ↓
Ravi
```

Shashank’s phone encrypts the message and sends it to Device A.

Device A cannot read the message. It only knows:

* Packet ID
* Destination identity
* Priority
* Expiration time
* Hop count
* Routing metadata

Device A forwards the packet to Device B, Device B forwards it to Device C, and Device C finally delivers it to Ravi.

An acknowledgement packet can travel back through the network to confirm delivery.

---

# Device Discovery

A production Narada application could discover nearby nodes using technologies such as:

* Bluetooth Low Energy
* Bluetooth Classic
* Wi-Fi Direct
* Wi-Fi Aware
* Google Nearby Connections
* Local hotspot communication
* Peer-to-peer radio modules
* LoRa gateways for long-range emergency communication

The transport technology can change depending on the hardware and situation.

Narada’s routing system is designed as a separate logical layer so that the same packet-routing system can work over different transport methods.

---

# Node Identity

Every registered device receives a unique Narada identity.

Example:

```text
NRD-IND-8F42A1
```

A node identity can be associated with:

* User account
* Device public key
* Last known network information
* Approximate last known region
* Trust score
* Authority status
* Routing history

The real system should not depend only on IP addresses because device IP addresses frequently change and may not be available during an infrastructure failure.

IP history may assist with estimating a device’s previous region, but real offline routing should primarily depend on:

* Nearby device discovery
* Device identities
* Location hints
* Encounter history
* Relay probability
* Destination sightings
* Authority gateways

---

# Routing Logic

Narada does not simply broadcast every message to every device.

Uncontrolled broadcasting would create:

* Duplicate packets
* Battery drain
* Network congestion
* Storage overload
* Privacy risks

Instead, Narada can calculate a routing score for nearby nodes.

A simplified routing decision may consider:

```text
Routing Score =
Destination Proximity
+ Recent Contact Probability
+ Node Reliability
+ Available Battery
+ Network Direction
- Congestion
- Previous Failed Attempts
```

A packet is forwarded to the node with the strongest routing score.

Possible routing strategies include:

* Direct delivery
* Controlled flooding
* Epidemic routing
* Spray-and-wait routing
* Geographic routing
* Encounter-based routing
* Probabilistic routing
* Authority-priority routing

The hackathon MVP simulates this process visually.

---

# Packet Structure

A Narada message can be represented as an encrypted packet.

Example conceptual structure:

```json
{
  "packetId": "PKT-9F82A1",
  "senderId": "NRD-A102",
  "receiverId": "NRD-B804",
  "type": "MESSAGE",
  "priority": "NORMAL",
  "encryptedPayload": "ENCRYPTED_CONTENT",
  "createdAt": "TIMESTAMP",
  "expiresAt": "TIMESTAMP",
  "hopCount": 2,
  "maxHops": 10,
  "visitedNodes": [
    "NRD-A102",
    "NRD-X432"
  ],
  "signature": "DIGITAL_SIGNATURE"
}
```

For emergency communication, the packet can use a higher priority:

```json
{
  "type": "SOS",
  "priority": "CRITICAL"
}
```

Critical packets should receive preference over ordinary chat messages.

---

# Emergency SOS Routing

Narada is not limited to personal messaging.

A user can create an emergency SOS containing:

* Emergency category
* Last known location
* Medical information provided by the user
* Number of people affected
* Short emergency message
* Timestamp
* Device identity

The SOS packet can be forwarded toward:

* Nearby authority nodes
* Police or disaster-response teams
* Medical response teams
* Rescue volunteers
* Emergency gateways
* Temporary command centres

Authority users can then:

* View active incidents
* Assign response teams
* Change incident status
* Mark incidents resolved
* Broadcast emergency instructions

---

# Security Model

Relay devices must not be able to read the messages they forward.

A production implementation should use:

* End-to-end encryption
* Public/private key cryptography
* Digital signatures
* Packet integrity verification
* Expiring packets
* Replay-attack protection
* Device trust management
* Secure identity exchange
* Local encrypted storage

The sender encrypts the message using the receiver’s public key.

Only the receiver’s private key can decrypt it.

Relay devices can inspect routing metadata but cannot access the original message content.

---

# Major Technical Challenges

Building Narada as a real decentralized network involves several complex engineering challenges.

## 1. Dynamic Network Topology

Devices continuously enter and leave communication range.

There is no permanent route between sender and receiver.

The routing engine must make decisions using temporary and incomplete information.

## 2. Intermittent Connectivity

Two nodes may connect for only a few seconds.

Packet exchange must be fast, resumable, and resistant to sudden disconnection.

## 3. Duplicate Packet Prevention

A message may reach the same device through multiple routes.

Each node must maintain packet identifiers and visited-node information to avoid forwarding duplicate packets indefinitely.

## 4. Battery Consumption

Continuous Bluetooth, Wi-Fi, GPS, and network scanning can consume significant battery power.

Narada requires:

* Adaptive scanning
* Battery-aware routing
* Low-power discovery
* Emergency-only activation
* Background activity optimisation

## 5. Routing Without Global Knowledge

No device has complete knowledge of the whole network.

Each node makes decisions using only local information such as nearby nodes, previous encounters, destination hints, and cached routing data.

## 6. Security and Malicious Nodes

A malicious device could attempt to:

* Read messages
* Drop packets
* Modify packets
* Create fake SOS alerts
* Replay old packets
* Flood the network

Digital signatures, encryption, rate limiting, identity verification, and trust scoring are required.

## 7. Device Compatibility

Different operating systems place restrictions on:

* Background Bluetooth
* Wi-Fi Direct
* Nearby-device scanning
* Location access
* Battery optimisation
* Peer-to-peer connections

A real implementation would require native Android development or a compatible cross-platform native framework.

## 8. Offline Identity Verification

Without central servers, devices must still verify that a packet was genuinely created by its claimed sender.

This requires locally stored public keys, signed identities, or periodically synchronised trust certificates.

## 9. Packet Expiration and Storage

Relay devices cannot store packets forever.

Each packet needs:

* Expiration time
* Maximum hop count
* Priority
* Storage size limit
* Automatic deletion rules

## 10. Emergency Traffic Priority

During a crisis, thousands of messages may enter the network.

SOS packets and authority broadcasts must be prioritised above ordinary communication.

---

# Current Hackathon MVP

The current Narada Messenger website is a functional simulation of the proposed decentralized system.

Because web browsers cannot fully control Bluetooth mesh networking, Wi-Fi Direct, or background peer-to-peer device discovery, the current version uses a centralized backend to simulate the real routing process.

The MVP demonstrates:

* User registration
* Unique Narada identities
* JWT authentication
* Real-time messaging
* MongoDB message storage
* Socket.IO communication
* Simulated multi-hop message routing
* Packet hop tracking
* Delivery-status updates
* Emergency SOS generation
* Authority incident management
* Response-team assignment
* Network visualisation
* Routing simulation
* Packet inspection
* Network analytics
* Disaster simulation controls
* Real-time notifications
* Browser notifications

---

# MVP Architecture

```text
React Frontend
      ↓
Express REST API
      ↓
Socket.IO Real-Time Layer
      ↓
Routing Simulation Engine
      ↓
MongoDB Atlas
```

In the MVP:

* React provides the user interface.
* Express handles API requests.
* MongoDB stores users, messages, emergencies, and routing data.
* Socket.IO provides real-time communication.
* The routing engine simulates devices acting as relay nodes.

---

# Real Production Architecture

A future production implementation could use:

```text
Mobile Application
      ↓
Local Device Discovery
      ↓
Encrypted Packet Manager
      ↓
Offline Routing Engine
      ↓
Bluetooth / Wi-Fi Direct / Nearby Connections
      ↓
Other Narada Devices
```

Optional cloud infrastructure would only be used when available for:

* User registration
* Public-key synchronisation
* Device trust updates
* Message backup
* Authority coordination
* Analytics
* Software updates

The core emergency communication system should continue functioning without the cloud.

---

# Technology Stack

## Frontend

* React
* Vite
* React Router
* Axios
* Socket.IO Client
* Lucide React

## Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* Socket.IO
* JSON Web Tokens
* bcrypt

## Proposed Real-Node Technologies

* Native Android
* Kotlin
* Bluetooth Low Energy
* Wi-Fi Direct
* Google Nearby Connections
* Room local database
* Android foreground services
* Public-key cryptography
* Delay-tolerant networking

---

# How to Run the Current MVP

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/narada-messenger.git
cd narada-messenger
```

## 2. Install frontend dependencies

```bash
npm install
```

## 3. Install backend dependencies

```bash
cd server
npm install
```

## 4. Configure backend environment variables

Create:

```text
server/.env
```

Add:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING

JWT_SECRET=YOUR_PRIVATE_JWT_SECRET
JWT_EXPIRES_IN=7d
```

Never commit this file.

## 5. Configure frontend environment variables

Create:

```text
.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 6. Start the backend

From the server folder:

```bash
npm run dev
```

The backend should run on:

```text
http://localhost:5000
```

## 7. Start the frontend

Open another terminal in the main project folder:

```bash
npm run dev
```

The frontend should run on:

```text
http://localhost:5173
```

---

# How to Test the System

## Test Messaging

1. Register two different users.
2. Open each account in a separate browser or incognito window.
3. Search for the other user using their Narada ID.
4. Send a message.
5. Observe the simulated relay route.
6. Check the packet delivery status.
7. Open the notification centre on the receiver’s account.

## Test Emergency SOS

1. Log in as a normal user.
2. Open the Emergency Centre.
3. Create an SOS incident.
4. Log in using an authority account.
5. Open the Authority Dashboard.
6. View the incoming incident.
7. Assign a response team.
8. Update the incident status.
9. Mark the emergency as resolved.

## Test Routing Tools

Use the following pages:

* Network Map
* Routing Simulator
* Packet Inspector
* Analytics Dashboard
* Simulation Control

These modules demonstrate how packets move between virtual devices.

---

# Environment Security

Real credentials are stored inside `.env` files.

These files are excluded from Git using `.gitignore`.

Never upload:

```text
.env
server/.env
```

Only safe template files should be committed:

```text
.env.example
server/.env.example
```

During deployment, environment variables must be entered directly into the hosting platform.

---

# Limitations of the Current Version

The current web application does not yet create a real offline Bluetooth or Wi-Fi Direct mesh.

It simulates node behaviour through:

* Backend routing logic
* Virtual relay devices
* Socket.IO events
* Stored packet metadata
* Visual routing paths

This approach allows the complete concept, user flow, routing logic, emergency workflow, and technical architecture to be demonstrated during a hackathon.

---

# Future Development

The next development stages include:

1. Building a native Android prototype
2. Implementing Bluetooth device discovery
3. Creating direct device-to-device packet transfer
4. Adding offline encrypted storage
5. Implementing spray-and-wait routing
6. Supporting delivery acknowledgements
7. Adding digital packet signatures
8. Creating authority gateway devices
9. Testing communication across moving devices
10. Integrating LoRa or long-range emergency gateways

---

# Long-Term Goal

Narada Messenger aims to create an emergency communication layer that does not depend entirely on internet access or cellular towers.

The final vision is a network where ordinary phones collaboratively form temporary communication infrastructure.

```text
No Tower
No Internet
No Central Router

Still Connected Through People
```

---

# Disclaimer

Narada Messenger is currently a hackathon prototype and research concept.

It should not yet be relied upon as a real emergency communication service without additional hardware testing, security auditing, native networking implementation, and regulatory validation.

---

# Project Status

**Current Stage:** Functional full-stack hackathon MVP

**Demonstrated:** Real-time communication, simulated decentralized routing, emergency coordination, packet inspection, analytics, and notification workflows.

**Next Stage:** Native Android peer-to-peer node prototype.

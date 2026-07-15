# naarada-messenger
The Premise: Aliens have destroyed the internet, mobile towers, and satellites. Normal digital communication is dead.          The Solution: RelayX, a decentralized offline communication system where every smartphone acts as a relay node.

Messages hop from device to device (Phone A → Phone B → Phone C → Phone D) until they reach their destination.

Core Features Implemented

    Offline Communication Simulation: Proving the concept of P2P network flow without relying on central routing.

    Store-Carry-Forward: Devices must store encrypted messages and forward them when another node connects.

    Emergency Priority: A queueing system where SOS/medical messages bypass standard messages.

    Area Broadcast: The ability to flood the local network with urgent alerts.

    End-to-End Encryption (E2EE): Relay nodes must not be able to decrypt the payload they are carrying.

    Smart Routing: Logic to select the best nearby node to pass data to (simulated).

Tech Stack

    Frontend: React.js

    Backend/Signaling: Node.js + Express

    Database: MongoDB or Firebase (to store user profiles/simulated persistent data)

    P2P / Network Simulation: WebSocket & WebRTC (We will use these to simulate the Bluetooth/Wi-Fi Direct offline mesh in a browser environment for the demo).

    Mapping: Leaflet Maps (to visualize device locations, node connections, and emergency)
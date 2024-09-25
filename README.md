# Wormhole: Peer-to-Peer Video Calling

Wormhole is a peer-to-peer video calling application built with WebRTC.

## Demo

![Demo Video Did Not Load](wormhole_demo.gif)

Apologies for the choppy gif; unfortunately GitHub's file size limitations make it difficult to embed longer videos.

## How it works

Wormhole is built with WebRTC, WebSockets, and MySQL.

- WebRTC is the technology that allows for two peers to connect directly to one another (in most cases, look into TURN servers for the exceptions).
- WebSockets are used for signaling. In order for users to connect to one another, they need to be aware of each other's existence. The WebSocket signaling server handles this by waiting for two users to connect to the same room and then relays their information so they can connect directly.
- MySQL is used for room creation/authenticaiton.

When a user creates a new room, an entry is added to our "rooms" table. The user will then send its "offer"--a string detailing the methods of connecting to it--to the WebSocket server. When another user joins that room, they will be sent the other user's "offer" and create an "answer" to it which is also given to the server. The server relays the answer to the original user and the two users connect directly.

## How to use it

### Prerequisites

- MySQL database

### Running the application

1. Create a table in your MySQL database named "rooms" with a single field called "id" which is a string
2. Add your databse credentials to a .env file in the format of .template.env. The PORT specifies which port the backend should be running on, defaults to 3000
3. Run `npm run dev` in the root folder
4. Navigate to http://localhost:4200 in your browser of choice

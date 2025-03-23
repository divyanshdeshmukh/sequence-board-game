# Web-Based Sequence Game Platform

## Overview

This project is a web-based platform for playing the Sequence board game online. It features real-time gameplay, allowing players to interact and compete live. The frontend is built with ReactJS, providing a responsive and intuitive user interface, while the backend is powered by Node.js (ExpressJS), ensuring efficient server-side logic and synchronization. WebSockets are utilized to enable real-time interactions, and MongoDB is used for scalable data storage.

## Features

- **Real-time Gameplay**: Uses WebSockets to facilitate live interactions among players.
- **Responsive UI**: Built with ReactJS to ensure a smooth and intuitive user experience across devices.
- **Robust Backend**: Powered by Node.js (ExpressJS) for efficient server-side logic.
- **Comprehensive Testing**: Utilizes Jest for testing to ensure robustness and performance.
- **Persistent Storage**: Employs MongoDB to manage user profiles and game states across sessions.

## Technologies Used

- **Frontend**: ReactJS, TailwindCSS
- **Backend**: Node.js, ExpressJS
- **Real-time Communication**: WebSockets (Socket.io)
- **Database**: MongoDB
- **Testing**: Jest
- **Containerization**: Docker

## Getting Started

### Prerequisites

- Node.js
- npm (Node Package Manager)
- Docker (for containerized setup)

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/divyanshdeshmukh/sequence-board-game.git
   cd sequence-board-game
   ```

2. **Install dependencies**
   ```sh
   # For the frontend:
   cd frontend
   npm install
   ```

### Running the Application

#### Using Docker

Ensure Docker is running on your machine.

```sh
docker-compose up --build
```

#### Without Docker

1. Start MongoDB
   Ensure you have MongoDB running locally or use a MongoDB cloud service.

2. Start the backend
   ```sh
   cd backend
   npm run
   ```

3. Start the frontend
   ```sh
   cd ../frontend
   npm run dev
   ```

## Access the Application

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Testing

Run tests using Jest:

```sh
cd backend
npm test
```

## Contributing

- Fork the repository
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

## License

This project is licensed under the Unlicense - see the `LICENSE` file for details.

## Contact

Divyansh Deshmukh  
MS in Computer Science @ University of California, Riverside

Project Link: [https://github.com/divyanshdeshmukh/sequence-board-game](https://github.com/divyanshdeshmukh/sequence-board-game)
```

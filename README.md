# Devnovate Blog Platform

A comprehensive blogging and article platform for writers and readers. Share your knowledge, discover amazing content, and connect with the community.

## Features

- User authentication (register, login, JWT-based sessions)
- Blog creation, editing, and publishing (with admin approval)
- Categories, tags, featured images, and excerpts
- Comments, likes, and views tracking
- Admin dashboard for managing users and blogs
- Responsive UI with dark mode support (Tailwind CSS)
- Email notifications for registration, blog approval/rejection, and comments
- RESTful API (Node.js, Express, MongoDB)
- React frontend with React Router, React Query, and context providers

## Project Structure

```
.
├── client/      # React frontend
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── server/      # Node.js backend
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── index.js
│   └── ...
├── .env
├── env.example
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v16+ recommended)
- npm or yarn
- MongoDB (local or cloud, e.g., MongoDB Atlas)

### 1. Clone the Repository

```sh
git clone https://github.com/yourusername/devnovate-blog-platform.git
cd devnovate-blog-platform
```

### 2. Environment Variables

Copy the example environment files and fill in your values:

```sh
cp env.example .env
cd server
cp ../env.example .env
```

Set up variables for MongoDB, JWT, email, etc.

### 3. Install Dependencies

#### Server

```sh
cd server
npm install
```

#### Client

```sh
cd ../client
npm install
```

### 4. Run the Application

#### Start the Server

```sh
cd ../server
npm run dev
```

#### Start the Client

```sh
cd ../client
npm start
```

- Client: http://localhost:3000
- Server: http://localhost:5000

### 5. Build for Production

#### Client

```sh
cd client
npm run build
```

#### Server

Set `NODE_ENV=production` and use a process manager like PM2 or deploy to your preferred platform.

## API Documentation

The backend exposes a RESTful API under `/api`. See [server/routes](server/routes) for available endpoints.

## Technologies Used

- **Frontend:** React, Tailwind CSS, React Router, React Query
- **Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer
- **Other:** ESLint, Prettier, dotenv, Helmet, Rate Limiting

## Folder Reference

- [client/src](client/src) - React app source code
- [server/routes](server/routes) - Express API routes
- [server/models](server/models) - Mongoose models
- [server/utils/emailService.js](server/utils/emailService.js) - Email notification logic




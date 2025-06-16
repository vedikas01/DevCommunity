# 🧑‍💻 DevCommunity

A full-stack Dev Community platform inspired by GitHub and Reddit, designed for developers to connect, share posts, showcase projects, and collaborate on discussions. Built with **MERN Stack** (MongoDB, Express, React, Node.js), the platform aims to foster an open-source-friendly environment with interactive and scalable features.

---

## 🚀 Features

- 📝 Create and manage developer profiles
- 🧵 Post threads, articles, or project updates
- 💬 Comment on and discuss posts
- 🔍 Search and filter through user content
- ❤️ Like and bookmark posts
- 🌐 Fully responsive frontend with modular UI

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Axios
- **Backend**: Node.js, Express.js, MongoDB
- **Database**: MongoDB Atlas
- **Cloud Services**: Cloudinary (for media uploads)
- **Auth**: JWT-based authentication
- **Dev Tools**: ESLint, Nodemon

---

## 📁 Monorepo Structure

```plaintext
DevCommunity/
│
├── backend/                         # Express.js backend server
│   ├── config/                      # Configuration files (DB, Cloudinary)
│   ├── controllers/                 # Logic for handling requests
│   ├── middleware/                  # Custom middleware (e.g. auth, error handling)
│   ├── models/                      # Mongoose models for MongoDB
│   ├── routes/                      # API route definitions
│   │   ├── auth.js                  # Routes for authentication
│   │   ├── posts.js                 # Routes for post-related actions
│   │   └── users.js                 # Routes for user actions
│   ├── uploads/                     # Temporary storage for media files
│   ├── .env                         # Environment variables (not committed)
│   ├── server.js                    # Backend entry point
│   └── package.json                 # Backend dependencies and scripts
│
├── frontend/                        # React.js client application
│   ├── public/                      # Public assets and HTML template
│   ├── src/
│   │   ├── assets/                  # Static images, icons, and logos
│   │   ├── components/              # Reusable UI components
│   │   ├── pages/                   # Pages/routes like Home, Profile, etc.
│   │   ├── redux/                   # State management using Redux
│   │   ├── services/                # Axios services for API calls
│   │   ├── App.js                   # Main React component
│   │   └── index.js                 # React entry point
│   └── package.json                 # Frontend dependencies and scripts
│
├── .gitignore                       # Git ignored files and folders
├── README.md                        # Project documentation
├── LICENSE                          # Open source license
└── package.json                     # Optional: root-level scripts (e.g. concurrently)

---

## 🧪 Getting Started

Follow these steps to get the DevCommunity project up and running locally on your machine.

### 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or above)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Cloudinary](https://cloudinary.com/) account
- [Git](https://git-scm.com/)

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/vedikas01/DevCommunity.git
cd DevCommunity






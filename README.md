# 🧑‍💻 DevCommunity
**DevCommunity** is a modern, full-stack web platform inspired by the collaborative nature of GitHub and the discussion-driven format of Reddit. It serves as a dedicated space for developers to:
- Connect with like-minded professionals and enthusiasts
- Share technical knowledge, project updates, and insightful articles
- Showcase personal and team projects to a global audience
- Collaborate on open-source initiatives and problem-solving discussions

Built with the **MERN Stack** — **MongoDB**, **Express.js**, **React.js**, and **Node.js** — the platform is designed for scalability, responsiveness, and real-time interactivity.
Its architecture supports secure authentication, efficient data handling, and seamless media management, enabling an open-source-friendly environment that encourages knowledge exchange, networking, and innovation within the developer community.

---

## 🚀 Features

- Create and manage developer profiles
- Post threads, articles, or project updates
- Comment on and discuss posts
- Search and filter through user content
- Like and bookmark posts
- Fully responsive frontend with modular UI

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
```
---

## 🧠 Getting Started
Follow the given steps to get the DevCommunity project up and running locally on your machine.

### 📋 Prerequisites

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
```
### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Update .env with MongoDB URI, Cloudinary config, JWT secret, etc.
npm install
npm run dev  # or `npm start` to launch the server
```
### 3. Frontend setup

```bash
cd frontend
npm install
npm start  # Runs the React app (usually on http://localhost:3000)
```
### ​🌱 Environment Variables

Example `.env` file for the backend
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
---
## 🤝 Contributing

Always open to contributions to, whether it’s bug fixes, feature requests, documentation improvements, or design suggestions — all are appreciated.

### Contribution Workflow
1. **Fork** the repository  
2. Create a new branch  
   ```bash
   git checkout -b feature/your-feature
   
3. Make your changes and commit
   ```bash
   git commit -m "Add: brief description of changes"
   
4. Push your branch to your fork
   ```bash
   git push origin feature/your-feature

6. Open a Pull Request and describe your changes clearly
   ```bash
   💡 Please ensure your code follows the existing style and passes any linting/formatting checks.
   ---
  ## 🙌 Acknowledgements

I would like to express my gratitude to the following for their inspiration, tools, and support in building **DevCommunity**:
- **MERN Stack Community** — for comprehensive documentation and best practices
- **GitHub & Reddit** — for inspiring the community-driven features of this platform
- **Cloudinary** — for providing free and reliable media storage solutions
- **MongoDB Atlas** — for offering a scalable and robust cloud database service
- **Open Source Contributors** — for valuable libraries, tools, and contributions
- **You** — for using, supporting, and improving this project ❤️
---

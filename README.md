# 🏗️ Static Content Management System (React + Express)

This is a **full-stack static content management system** built with **React (frontend)** and **Express.js (backend)**. It dynamically generates webpages based on Markdown content stored in folders, allowing easy content management.

🚀 **Features**
- Automatically generates pages from markdown (`.md`) files.
- **CRUD functionality** to add new folders dynamically.
- Uses **React Router** for navigation.
- **Left Sidebar Navigation** (CRM-style layout).
- Fetches content dynamically from an Express.js backend.
---

## 📌 **Project Setup & Installation**
### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/raulsposito/static-content-cms.git
cd static-content-cms
```

## Install Dependencies
### 📦 Install both backend & frontend dependencies:

```
npm install
cd client
npm install
```

## Start the Backend
### The backend runs on Express.js, listening on port 5001 by default.

```
node server.js
```

## Start the React Frontend
### The frontend runs on React, served on localhost:3000.

```
cd client
npm start
```

## Open in Browser
### Once both servers are running, open:

🌎 http://localhost:3000 → React App (Frontend)
🛠 http://localhost:5001/api/content/about-page → Fetches HTML for /about-page
🗂 http://localhost:5001/api/structure → Returns JSON structure of content

### 🚀 Future Enhancements

 📝 Edit markdown files in a WYSIWYG editor
 🗑️ Delete folders & pages
 📂 Drag & Drop reordering of folders
 🌎 Deploy to Vercel / Heroku

### Contributing
## Contributions are welcome! If you’d like to improve the project:

Fork the repository
Create a feature branch (git checkout -b feature-branch)
Commit your changes (git commit -m "Added new feature")
Push to your fork (git push origin feature-branch)
Open a Pull Request

### License
## This project is licensed under the MIT License.


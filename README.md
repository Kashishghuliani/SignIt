# SignIt ✍️

**SignIt** is a full-stack web application that allows users to upload PDF documents, add digital signatures, and manage signed documents through a simple web interface.

The project is built using the **MERN stack** with PDF processing capabilities and secure user authentication.

## 🚀 Live Demo

**Frontend:**
https://sign-it-two.vercel.app/

## 📌 Overview

SignIt simplifies the process of digitally signing PDF documents.

Users can:

* Create an account or authenticate using Google
* Upload PDF documents
* Preview PDF files directly in the browser
* Add a signature to a document
* Generate and download the signed PDF
* Manage documents through the application

The project uses a separate **React frontend** and **Node.js/Express backend**, communicating through REST APIs.

## ✨ Features

### 🔐 Authentication

* User registration and login
* JWT-based authentication
* Google OAuth authentication
* Protected application routes
* Secure user sessions

### 📄 PDF Management

* Upload PDF documents
* Preview PDFs in the browser
* Process PDF files on the backend
* Add signatures to PDF documents
* Generate the updated signed PDF
* Download the signed document

### ✍️ Digital Signature

Users can place their signature on a PDF and generate a signed version of the document.

The application uses PDF processing libraries to work with PDF files while keeping the signing workflow inside the web application.

### 📡 REST APIs

The backend exposes REST APIs for:

* Authentication
* User management
* PDF upload
* PDF processing
* Signature-related operations
* Document management

The APIs can be tested using **Postman**.

## 🛠️ Tech Stack

### Frontend

* React.js
* React Router
* Tailwind CSS
* Axios
* React PDF

### Backend

* Node.js
* Express.js
* REST APIs
* JWT Authentication
* Google OAuth

### Database

* MongoDB

### PDF & File Processing

* PDF-Lib
* Multer
* React PDF

### Development Tools

* Git
* GitHub
* Postman
* Vercel

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      User           │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │  PDF Preview        │
                    │  Authentication     │
                    │  Signature UI       │
                    └──────────┬──────────┘
                               │
                         REST APIs
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Node.js + Express   │
                    │                     │
                    │ Authentication      │
                    │ File Upload         │
                    │ PDF Processing      │
                    └──────────┬──────────┘
                               │
                     ┌─────────┴─────────┐
                     ▼                   ▼
              ┌─────────────┐     ┌─────────────┐
              │  MongoDB    │     │  PDF-Lib    │
              │             │     │             │
              │ User/Data   │     │ PDF Editing │
              └─────────────┘     └─────────────┘
```

## 📁 Project Structure

```text
SignIt/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   └── ...
│
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── ...
│
├── .gitignore
└── README.md
```

## 🔄 Application Flow

```text
User
 │
 ▼
Login / Register
 │
 ▼
Authentication
 │
 ▼
Upload PDF
 │
 ▼
PDF Preview
 │
 ▼
Place Signature
 │
 ▼
Send PDF to Backend
 │
 ▼
PDF Processing
 │
 ▼
Signed PDF Generated
 │
 ▼
Download Signed PDF
```

## 🔐 Authentication Flow

SignIt uses JWT-based authentication for protecting application resources.

```text
User Login
    │
    ▼
Backend validates credentials
    │
    ▼
JWT Token Generated
    │
    ▼
Token sent to Client
    │
    ▼
Authenticated API Requests
    │
    ▼
Backend validates JWT
    │
    ▼
Protected Resource Access
```

Google OAuth is also supported as an authentication option.

## 📄 PDF Processing

The application uses:

**React PDF**
Used on the frontend to render and preview PDF documents.

**Multer**
Used by the backend to handle PDF file uploads.

**PDF-Lib**
Used for manipulating PDF documents and applying the required changes before generating the final document.

## 🧪 API Testing

Backend APIs can be tested using **Postman**.

Example API workflow:

```text
Authentication
      ↓
Upload PDF
      ↓
Process Document
      ↓
Apply Signature
      ↓
Receive Signed PDF
```

Postman can be used to verify request parameters, authentication, API responses, and error handling.

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Kashishghuliani/SignIt.git

cd SignIt
```

### 2. Install Client Dependencies

```bash
cd client
npm install
```

### 3. Install Server Dependencies

Open another terminal:

```bash
cd server
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

Add any other environment variables required by the application configuration.

> Never commit `.env` files or secret credentials to GitHub.

### 5. Start the Backend

```bash
cd server
npm start
```

### 6. Start the Frontend

In another terminal:

```bash
cd client
npm start
```

The frontend will then be available at the local development URL configured by the project.

## 🔒 Security

The application uses authentication and protected API routes to restrict access to user-specific functionality.

Security-related practices include:

* JWT-based authentication
* Google OAuth
* Protected backend routes
* Environment variables for sensitive credentials
* Server-side PDF processing
* File upload handling through Multer

## 👨‍💻 Author

**Kashish Ghuliani**

## 📄 License

This project is intended for educational and portfolio purposes.

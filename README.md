### 📝 My Notes App

A simple yet powerful full-stack application for managing personal notes. Create, edit, and save your notes locally or sync them across devices with a secure cloud-based database.

-----

### ✨ Features

  * **Offline First**: Notes are automatically saved to your browser's local storage.
  * **Secure Authentication**: Users can sign up and log in securely with JWT-based authentication.
  * **Cloud Sync**: Log in to save your notes to a cloud database and access them from anywhere.
  * **Undo & Redo**: Correct mistakes with easy-to-use undo and redo functionality.
  * **Personalization**: Toggle between light and dark themes to suit your viewing preference.

-----

### 🚀 Getting Started

Follow these steps to set up and run the project on your local machine.

#### Prerequisites

  * Node.js (LTS version recommended)
  * npm (or yarn)
  * A MongoDB database (local or cloud-hosted)

#### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/my-notes-app.git
    cd my-notes-app
    ```

2.  **Install server dependencies:**

    ```bash
    npm install
    ```

#### Configuration

1.  Create a `.env` file in the root directory.

2.  Add your MongoDB connection string and a secret key for JWT.

    ```bash
    DB_URL=your_mongodb_connection_string
    JWT=your_super_secret_jwt_key_here
    ```

#### Running the App

1.  Start the server from the project's root directory:

    ```bash
    node server.js
    ```

    The server will start on `http://localhost:5000`.

2.  Open your browser and go to `http://localhost:5000` to use the application.

-----

### 🛠️ Technologies

  * **Frontend**: `HTML5`, `CSS3`, `Vanilla JavaScript`
  * **Backend**: `Node.js`, `Express.js`
  * **Database**: `MongoDB` (via `Mongoose`)
  * **Authentication**: `JSON Web Tokens (JWT)`, `bcryptjs`
  * **Environment**: `dotenv`

-----

### Contact 📧

  * **Your Name**: Abdullah Shalabi
  * **Email**: [abdullahshalabi.95@gmail.com]

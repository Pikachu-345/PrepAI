# PrepAI - AI-Powered Interview Preparation App

PrepAI is a full-stack Single Page Application (SPA) designed to help users prepare for job interviews. Users can sign up/login, upload their resume and a job description (in PDF format), and then engage in a simulated interview with an AI. The AI generates relevant questions based on the job description and evaluates the user's responses against their resume, providing feedback and a score using Retrieval-Augmented Generation (RAG).

---

## Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Axios, react-router-dom, react-hot-toast, react-dropzone, react-markdown, lucide-react
* **Backend:** Node.js, Express, MongoDB (Atlas with Vector Search), Mongoose, JWT (jsonwebtoken), bcryptjs, Cloudinary (for file storage), pdf-parse, LangChain.js, Google Generative AI (`@google/genai`)
* **Deployment:** Vercel (Frontend), Render (Backend)

---

## Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn
* Git
* Accounts for:
    * MongoDB Atlas 
    * Cloudinary 
    * Google AI Studio (for Gemini API Key)
    * GitHub
    * Vercel
    * Render

---

## Project Structure

```

PrepAI/
├── client/     \# React Frontend
├── server/     \# Node.js Backend
└── README.md

````

---

## Setup Instructions

**1. Clone the Repository:**

```bash
git clone https://github.com/Pikachu-345/PrepAI.git
cd PrepAI
````

**2. Backend Setup (`/server`):**

```bash
cd server
npm install
```

  * Create a `.env` file in the `/server` directory and add the following environment variables:

    ```env
    # MongoDB Atlas Connection String
    MONGO_URI=your_mongodb_uri

    # JSON Web Token Secret (use a strong, random string)
    JWT_SECRET=jwt_secret

    # Google Gemini API Key (from Google AI Studio)
    GEMINI_API_KEY=your_gemini_api_key

    # Cloudinary Credentials (from Cloudinary Dashboard)
    CLOUDINARY_CLOUD_NAME=your_cloud_name
    CLOUDINARY_API_KEY=your_api_key
    CLOUDINARY_API_SECRET=your_api_secret

    # Server Port (optional, defaults to 5000)
    PORT=5000
    ```

  * **Important:** Set up your MongoDB Atlas Cluster:

      * Create a free M0 cluster.
      * Allow network access from anywhere (`0.0.0.0/0`) or your specific IP for local development.
      * Create a database user and use its credentials in `MONGO_URI`.
      * Create the **Atlas Vector Search index** on the `chunks` collection (Database -\> Search -\> Create Index -\> JSON Editor) with the following definition:
        ```json
        {
          "fields": [
            { "type": "vector", "path": "embedding", "numDimensions": 768, "similarity": "cosine" },
            { "type": "filter", "path": "user" },
            { "type": "filter", "path": "type" },
            { "type": "filter", "path": "document" }
          ]
        }
        ```
        *(Ensure the index name matches the one used in `server/routes/chat.js`, e.g., `vector_index_chunks`)*

**3. Frontend Setup (`/client`):**

```bash
cd ../client
npm install
npm install -D @tailwindcss/typography
```


  * Create a `.env` file in the `/client` directory and add the following environment variable:

    ```env
    VITE_API_URL=http://localhost:5000
    ```

    *(Note: For deployment, this will be your live Render URL).*

-----

## Running the Application Locally

1.  **Start the Backend Server:**

      * Open a terminal in the `/server` directory.
      * Run: `npm run dev`
      * The server should start (typically on port 5000) and connect to MongoDB.

2.  **Start the Frontend Server:**

      * Open a *separate* terminal in the `/client` directory.
      * Run: `npm run dev`
      * Vite will start the development server (usually on port 5173).

3.  **Access the App:**

      * Open your web browser and navigate to `http://localhost:5173`.


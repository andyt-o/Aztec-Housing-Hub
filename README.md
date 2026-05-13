# Aztec Housing Hub

Housing availability is a serious issue for students at San Diego State University. Limited on-campus housing, rising rent, and growing enrollment make it difficult to find affordable options. Aztec Housing Hub is a platform designed to help SDSU students find safe, affordable housing and connect with compatible roommates, avoiding the stress and scams often found on social media or outdated listing sites.

## Features

- **Housing Listings:** Browse, filter, and view on-campus and off-campus housing options.
- **User Authentication:** Secure login and registration using SDSU email addresses (`@sdsu.edu`).
- **Roommate Matching:** Create a profile with your lifestyle preferences (cleanliness, sleep schedule, hobbies) to find compatible roommates.
- **Listing Management:** Authenticated users can create, edit, and delete their own housing listings.
- **Profanity Filtering:** Automated server-side validation to ensure a safe and respectful community environment.
- **Click Tracking & Analytics:** Track and display view counts for individual listings.

## Architecture

The application follows a modern web application architecture:

- **Frontend:** React (built with Vite) providing a responsive user interface for browsing listings, managing profiles, and interacting with the platform.
- **Backend:** Python HTTP server handling API requests, business logic, authentication, and profanity filtering.
- **Database:** PostgreSQL storing user accounts, housing listings, click history, and roommate preferences.

## Prerequisites

- Node.js (v18+)
- Python 3.10+
- PostgreSQL database

## Setup Instructions

### 1. Database Configuration

1. Ensure you have a running PostgreSQL instance.
2. Create a new database for the application.
3. In the `Backend/` directory, create a `.env` file and set your database connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/aztec_housing"
   ```

### 2. Backend Setup

The Python backend manages the API and database connections.

1. Open a terminal and navigate to the `Backend/` directory:
   ```bash
   cd Backend
   ```
2. (Optional but recommended) Create and activate a virtual environment.
3. Install the required Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   python main.py
   ```
   *The server will run on `http://127.0.0.1:5000`.*

### 3. Frontend Setup

The React frontend lives in the `client/` directory and uses Vite.

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install the Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173`.*

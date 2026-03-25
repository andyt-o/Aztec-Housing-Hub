# Aztec-Housing-Hub
Housing availability is a serious issue for students at San Diego State University. Limited on-campus housing, rising rent, and growing enrollment make it difficult to find affordable options. Many rely on social media or outdated listings, leading to stress, scams, or unsafe living conditions, especially for transfer and first-year students.
---

## Architecture Overview
The application follows a simple web application architecture with three main components:

**Frontend**
- Provides the user interface for browsing housing listings and interacting with the map.
- Allows users to filter listings and manage saved housing options.

**Backend**
- Handles application logic, user accounts, and communication between the frontend and database.

**Database**
- Stores user accounts, housing listings, and saved listings.

---

## Setup
Clone the repository and install dependencies.

### Frontend
The React frontend lives in `client/` and uses Vite.

1. Open a terminal in `Aztec-Housing-Hub/client`
2. Run `npm.cmd install`
3. Run `npm.cmd run dev`

### Backend
How to run the backend:

1. Open a terminal in `Aztec-Housing-Hub/Backend`
2. Run `python main.py`

### Sprint 1 Homepage ~ 2 weeks
The homepage currently includes:

- A polished SDSU-focused landing page
- A hero section introducing Aztec Housing Hub
- Static preview content for a future housing search experience
- Feature and workflow sections for the initial project presentation

The current version is intentionally simple and frontend-focused so the project
has a strong first commit without adding unnecessary backend complexity.

### Sprint 2 Backend + More Frontend ~ 1 week
- Working user login/sign up.
- Stores user data safely and securely.
- Connected the frontend to the backend.

### Sprint 3 Profile + Roommate Matching ~ 1 week
- Added a Profile tab where logged-in users can enter roommate preferences such as hobbies, cleanliness, and sleep schedule.
- Added a Roommates tab that shows potential roommate cards and compatibility scores.
- Added roommate filters so users can find similar roommates by cleanliness, sleep schedule, hobby keyword, and a match percentage.

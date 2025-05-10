# NSU Course Scheduler

A web application for finding and monitoring available course schedules at North South University (NSU) based on specific constraints and preferences.

## Features

- **Real-time Updates**: Automatically refreshes course availability data every 30 seconds
- **Hard Constraints**: Applies 11 specific scheduling constraints to find valid schedules
- **Preference-Based Ranking**: Ranks schedules based on 3 soft preferences
- **Favorites**: Save preferred schedules for easy monitoring
- **Change Highlighting**: Clearly shows when seat availability changes

## Project Structure

The project is organized into two main components:

### Backend (Flask API)

- `backend/app.py`: Main Flask application entry point
- `backend/api/`: API routes and endpoints
- `backend/core/`: Core scheduler functionality (copied from src/)
  - `scraper.py`: Web scraping module for course data
  - `filters.py`: Constraint filtering implementation
  - `scheduler.py`: Schedule generation and scoring

### Frontend (React)

- `frontend/src/`: React application source code
  - `components/`: React components
  - `pages/`: Page components
  - `utils/`: Utility functions
  - `hooks/`: Custom React hooks

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Run the Flask application:
   ```
   python app.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

The application will be available at http://localhost:3000

## Deployment

### Backend Deployment

The Flask backend can be deployed to platforms like Heroku, AWS, or Google Cloud.

Example Heroku deployment:
```
heroku create nsu-scheduler-api
git subtree push --prefix backend heroku main
```

### Frontend Deployment

The React frontend can be deployed to Netlify, Vercel, or GitHub Pages.

Example build process:
```
cd frontend
npm run build
```

## Technologies Used

- **Backend**: Flask, Pandas, BeautifulSoup
- **Frontend**: React, styled-components, React Query
- **Data Flow**: REST API, localStorage

## Hard Constraints

The system applies the following hard constraints:

- H1: Required lectures – choose exactly one lecture section for each of: BIO 103, CSE 327, CSE 332, EEE 452, ENG 115
- H2: Required labs – choose exactly one lab section for each of: CHE 101 L and PHY 108 L
- H3: Lecture start‐time ≥ 11:00 (inclusive) for every non-lab section
- H4: Lecture day pattern – every non-lab section's days must be either {S,T} (ST) or {M,W} (MW)
- H5: Lab day options – a lab's days may be any subset of {S,T,M,W,R,A}
- H6: CSE 332 lecture–lab pairing – the CSE 332 lecture and its matching CSE 332 L lab must have identical section numbers
- H7: CSE 327 instructor – must be taught by "NBM" (Section 1 or Section 7 in current data)
- H8: No time collisions – if two chosen sections share at least one day and their time intervals overlap, reject the pair
- H9: Seat availability – only select sections with seats > 0
- H10: No 08:00 labs – exclude any lab whose start_time is exactly "08:00"
- H11: At most 5 distinct class-days per week

## Soft Preferences

For ranking valid schedules:
- P1: 4 distinct class-days (perfect) vs 5 - +100 if 4 days, +50 if 5 days
- P2: Later lab starts - subtract (11 - start_hour) for each lab that starts before 11 AM
- P3: Compact days - subtract total idle minutes across the week

## Target Courses

- BIO 103 (3 credits)
- CSE 327 (3 credits)
- CSE 332 (3 credits)
- EEE 452 (3 credits)
- ENG 115 (3 credits)
- PHY108L (1 credit)
- CHE101L (1 credit)

## Installation

1. Clone this repository:
   ```
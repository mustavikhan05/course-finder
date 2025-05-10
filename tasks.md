NSU Course Scheduler Development Todo List
Project Overview for AI Agent
This project creates a personal tool for monitoring available course sections at North South University (NSU). The core purpose is to help find ideal course schedules based on specific preferences.

## Current Constraint System

### Hard Constraints (All must be satisfied)
H1: Required lectures – choose exactly one lecture section for each of: BIO 103, CSE 327, CSE 332, EEE 452, ENG 115
H2: Required labs – choose exactly one lab section for each of: CHE 101 L and PHY 108 L
H3: Lecture start‐time ≥ 11:00 (inclusive) for every non-lab section
H4: Lecture day pattern – every non-lab section's days must be either {S,T} (ST) or {M,W} (MW)
H5: Lab day options – a lab's days may be any subset of {S,T,M,W,R,A}
H6: CSE 332 lecture–lab pairing – CSE 332 lecture and its matching CSE 332 L lab must have identical section numbers
H7: CSE 327 instructor – must be taught by "NBM" (Section 1 or Section 7 in current data)
H8: No time collisions – if two chosen sections share at least one day and their time intervals overlap, reject the pair
H9: Seat availability – only select sections with seats > 0
H10: No 08:00 labs – exclude any lab whose start_time is exactly "08:00"
H11: At most 5 distinct class-days per week
H12: No evening classes - exclude any section with start time ≥ 6:00 PM (optional filter)

### Soft Preferences (For ranking valid schedules)
P1: 4 distinct class-days (perfect) vs 5 - +100 if 4 days, +50 if 5 days
P2: Later lab starts - subtract (11 - start_hour) for each lab that starts before 11 AM
P3: Compact days - subtract total idle minutes across the week

Target Courses:
- BIO103 (3 credits) - Lecture course
- CHE101L (1 credit) - Lab course
- CSE327 (3 credits) - Lecture course
- CSE332 (3 credits) - Lecture course
- CSE332L (0 credits) - Lab course
- EEE452 (3 credits) - Lecture course
- ENG115 (3 credits) - Lecture course
- PHY108L (1 credit) - Lab course

Workflow:
- Scrape the NSU course offerings page
- Filter sections that meet all hard constraints
- Generate valid schedule combinations
- Score schedules based on soft preferences
- Display results in a simple dashboard
- Automatically refresh every 30 seconds to check for changes

# NSU Course Scheduler Development Todo List

## Initial Setup for Cursor/AI Agent

- [x] Create project structure with `main.py`, `scraper.py`, `filters.py`, and `scheduler.py` (May 10, 2023)
- [x] Install required packages: `requests`, `beautifulsoup4`, `pandas`, `colorama`, `schedule` (May 10, 2023)
- [x] Update task status with timestamps when completed (May 15, 2023)
- [x] Mark tasks as "DONE" when I verify they work as expected (June 2, 2023)
- [x] Add clear docstrings and comments for each function (May 10, 2023)
- [x] Get my approval before implementing any complex algorithms or changing the planned approach (June 2, 2023)
- [x] Commit changes at every logical point in development (May 15, 2023)

## 1. Web Scraping Module (`scraper.py`)

### HTML Page Structure (From Screenshots)
- Page title: "Offered Course List (Summer 2025)"
- Page updates every 5 minutes automatically
- Table has ID "offeredCourseTbl" with class "oferedtable table table-bordered table-striped table-hover dataTable no-footer"
- Table is inside a div with ID "offeredCourseTbl_wrapper" and class "dataTables_wrapper no-footer"
- Table has a thead and tbody structure
- Rows alternate between classes "odd" and "even"

### Table Structure
- Column 1: # (row number)
- Column 2: Course (e.g., ACT201)
- Column 3: Section (e.g., 1, 2, 3)
- Column 4: Faculty (e.g., AhU, ARm, Asy)
- Column 5: Time (e.g., "RA 11:20 AM - 12:50 PM", "ST 04:20 PM - 05:50 PM")
- Column 6: Room (e.g., NAC206, NAC309)
- Column 7: Seats Available (e.g., 35)

### Day/Time Format
- Day codes come first (e.g., "ST", "RA")
- Followed by start time and end time separated by " - "
- Time in 12-hour format with AM/PM indicator

- [x] Create function to fetch course page with proper headers and error handling (May 10, 2023) - DONE
- [x] Examine page HTML structure to identify course table elements (May 10, 2023) - DONE
- [x] Implement HTML parsing function that extracts all courses into a DataFrame (May 10, 2023) - DONE
- [x] Include columns: course_code, section, title, credit, day_time, room, instructor, seats (May 10, 2023) - DONE
- [x] Add parsing for day/time format to extract days (ST, MW, etc.) and times separately (May 10, 2023) - DONE
- [x] Create function to filter just the requested courses (BIO103, CSE327, etc.) (May 10, 2023) - DONE
- [x] Add data cleaning functions to standardize extracted information (May 10, 2023) - DONE
- [x] Test scraper with sample page to verify extraction accuracy (May 10, 2023) - DONE
- [x] Add support for cross-listed courses (e.g., CSE332/EEE336) (May 15, 2023) - DONE
- [x] Successfully tested connection to NSU course offerings page (May 15, 2023) - DONE

## 2. Filter Implementation (`filters.py`)

- [x] Create function to filter courses based on start time (≥ 11:00 AM for lectures) (June 2, 2023) - DONE
- [x] Create function to check if section days are ST or MW only for lectures (May 10, 2023) - DONE
- [x] Implement CSE 327 section/instructor filter (sections 1 or 7, instructor NBM) (May 10, 2023) - DONE
- [x] Implement function to ensure CSE 332 lecture and lab have identical section numbers (June 2, 2023) - DONE
- [x] Create filter for available seats (> 0) (June 2, 2023) - DONE
- [x] Create filter to exclude 08:00 AM lab sections (June 2, 2023) - DONE
- [x] Implement function to count distinct days in a schedule (must be ≤ 5 days) (June 2, 2023) - DONE
- [x] Create master filter function that applies all hard constraints to course DataFrame (June 2, 2023) - DONE
- [x] Implement optional filter to exclude evening classes (start time ≥ 6:00 PM) (May 10, 2025) - DONE

## 3. Schedule Generator (`scheduler.py`)

- [x] Implement algorithm to find all valid section combinations (May 10, 2023) - DONE
- [x] Add function to check for scheduling conflicts between sections (May 10, 2023) - DONE
- [x] Implement function to calculate total days in a schedule (May 10, 2023) - DONE
- [x] Implement scoring system based on soft preferences (June 2, 2023) - DONE
  - [x] Add scoring for 4-day vs 5-day schedules (P1) - DONE
  - [x] Add penalty for early labs (P2) - DONE
  - [x] Add penalty for idle time between classes (P3) - DONE
- [x] Create function to format schedule for display (May 10, 2023) - DONE
- [x] Implement partial schedule generation when full schedules cannot be found (May 15, 2023) - DONE
- [x] Add debugging statistics to track scheduling constraints and failures (May 15, 2023) - DONE

## 4. Main Application (`main.py`)

- [x] Set up main loop to run every 30 seconds using `schedule` library (May 10, 2023) - DONE
- [x] Implement function to store previous results and detect changes (May 10, 2023) - DONE
- [x] Create simple text-based dashboard to display valid schedules (May 10, 2023) - DONE
- [x] Add color coding for new/changed schedules (May 10, 2023) - DONE
- [x] Implement basic configuration options (refresh rate, display preferences) (May 10, 2023) - DONE
- [x] Add simple notification for when new valid schedules appear (May 10, 2023) - DONE
- [x] Update display to show top 10 schedules instead of top 5 (June 2, 2023) - DONE
- [x] Add dual display mode to show both schedules with and without evening classes (May 10, 2025) - DONE

## 5. Testing & Refinement

- [x] Test with real NSU webpage to verify scraping works correctly (May 15, 2023) - DONE
- [x] Create test cases for various filter combinations (May 10, 2023) - DONE
- [x] Add error handling for network issues or website changes (May 10, 2023) - DONE
- [x] Create mock data for testing when actual website is unavailable (May 10, 2023) - DONE
- [x] Test scraper with mock data to verify parsing logic (May 10, 2023) - DONE
- [x] Test full system operation for multiple refresh cycles (May 15, 2023) - DONE
- [x] Refine display format based on actual data (May 15, 2023) - DONE
- [x] Test with updated hard constraints and soft preferences (June 2, 2023) - DONE

## 6. Analysis & Diagnostic Tools

- [x] Create export_raw_data.py to save target course data to text files (May 15, 2023) - DONE
- [x] Develop analyze_sections.py to show detailed info about available sections (May 15, 2023) - DONE
- [x] Implement check_lab_sections.py to diagnose CSE332/CSE332L pairing issues (May 15, 2023) - DONE
- [x] Fix redundancy in export_raw_data.py (correctly exports only target courses data) (May 15, 2023) - DONE
- [x] Move utility scripts to separate utilities/analysis directory for better organization (June 2, 2023) - DONE
- [x] Create move_utility_files.py script to help manage file organization (June 2, 2023) - DONE
- [ ] Create a comprehensive analysis report of scheduling constraints
- [ ] Implement visualization of available sections and constraints

## Current Status (May 10, 2025)

1. **Successfully Implemented All 12 Hard Constraints**:
   - H1-H12 constraints properly applied during filtering and schedule generation
   - Finding 920 valid complete schedules that meet all criteria

2. **Schedule Scoring System**:
   - P1: Prefer 4-day schedules (+100 points) over 5-day schedules (+50 points)
   - P2: Penalize early lab start times (earlier than 11 AM)
   - P3: Penalize idle time between classes for compactness

3. **Organized Codebase**:
   - Core modules: scraper.py, filters.py, scheduler.py, main.py
   - Analysis utilities moved to utilities/analysis directory
   - Config settings in config/settings.py

4. **User Interface**:
   - Implemented both CLI and Web interfaces
   - CLI: Color-coded text-based dashboard showing top 10 schedules (run via run.sh)
   - Web: Modern React frontend with responsive design (run via run_frontend.sh)
   - Real-time updates with 30-second auto-refresh
   - Favorites system with localStorage persistence
   - Frontend successfully tested and connected to backend API

5. **Backend API**:
   - Flask backend with RESTful endpoints
   - CORS support for cross-origin requests
   - JSON responses with schedules and metadata
   - Error handling and status reporting
   - Successfully tested API endpoints

The system is now fully functional for monitoring available course sections and finding optimal schedules that meet all 12 hard constraints, ranked according to the 3 soft preferences. Both CLI and Web interfaces are operational, with the web interface offering additional features like favorites and filtering.

## 9. Deployment Plan for Render

The goal is to deploy the current version first and then add user input functionality later.

### 9.1 Backend Deployment on Render

- [ ] Update backend/requirements.txt to include all dependencies
  ```
  flask==2.0.1
  flask-cors==3.0.10
  beautifulsoup4==4.10.0
  pandas==1.3.3
  requests==2.26.0
  schedule==1.1.0
  gunicorn==20.1.0
  ```

- [ ] Create a Procfile in the backend directory
  ```
  web: gunicorn 'app:create_app()' --bind=0.0.0.0:$PORT
  ```

- [ ] Sign up for Render (https://render.com/) if you haven't already

- [ ] Create a new Web Service on Render:
  - Connect your GitHub repository
  - Name: nsu-scheduler-api
  - Root Directory: backend
  - Environment: Python 3
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `gunicorn 'app:create_app()' --bind=0.0.0.0:$PORT`
  - Plan: Free

- [ ] Configure environment variables on Render (if needed):
  - NSU_COURSE_URL: URL for the NSU course offerings page
  - REFRESH_INTERVAL: Time between data refreshes in seconds

- [ ] Test the backend API after deployment:
  - Visit https://nsu-scheduler-api.onrender.com/api/status
  - Verify it returns proper status JSON

### 9.2 Frontend Deployment on Render

- [ ] Update the API base URL in frontend/src/utils/api.js:
  ```javascript
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://nsu-scheduler-api.onrender.com/api';
  ```

- [ ] Create a new Static Site on Render:
  - Connect your GitHub repository
  - Name: nsu-scheduler-frontend
  - Root Directory: frontend
  - Build Command: `npm install && npm run build`
  - Publish Directory: build
  - Environment Variables:
    - REACT_APP_API_URL: https://nsu-scheduler-api.onrender.com/api

- [ ] Test the deployed frontend:
  - Visit the URL provided by Render
  - Verify it connects to the backend
  - Test toggling evening classes
  - Try saving a favorite schedule

### 9.3 Backend CORS Configuration

- [ ] Update the CORS configuration in backend/app.py:
  ```python
  # Add your frontend URL to the allowed origins
  CORS(app, origins=["https://nsu-scheduler-frontend.onrender.com"])
  ```

- [ ] Redeploy the backend to apply changes

### 9.4 Setup Automatic Deployment

- [ ] Configure GitHub repository to auto-deploy on push:
  - Set up webhook from GitHub to Render
  - Test by making a small change and pushing to GitHub
  - Verify both backend and frontend update automatically

### 9.5 Monitor and Troubleshoot

- [ ] Set up Render dashboard monitoring
- [ ] Check logs for any errors
- [ ] Monitor response times and performance
- [ ] Test the application thoroughly after deployment

## 10. User Input Interface Implementation (Future Enhancement)

### 10.1 Backend API Enhancements

- [ ] Create a new endpoint for dynamic schedule generation:
  ```
  POST /api/schedules/generate
  ```

- [ ] Implement request validation for user constraints:
  - Required courses list
  - Time restrictions
  - Day pattern preferences
  - Instructor preferences
  - Maximum days
  - Evening class preferences

- [ ] Modify the filter and scheduler modules to accept dynamic constraints:
  - Update apply_filters() to accept parameters from request
  - Update generate_schedules() to work with custom course lists
  - Ensure all constraints are properly validated

- [ ] Add error handling for invalid constraint combinations

### 10.2 Frontend UI Components

- [ ] Create a CourseConstraintsForm component:
  - Input fields for required courses
  - Dropdowns for time restrictions
  - Checkboxes for day pattern preferences
  - Input for specific instructor requirements
  - Toggle for evening classes
  - Slider for maximum days per week

- [ ] Implement form validation:
  - Ensure required fields are filled
  - Validate course codes against a known list
  - Show helpful error messages

- [ ] Update Dashboard component:
  - Add the constraints form at the top
  - Add a "Generate Schedules" button
  - Show loading state during API calls
  - Display error messages if generation fails

- [ ] Implement state management for user constraints:
  - Save form values to localStorage
  - Restore values when the page loads
  - Reset button to clear all constraints

### 10.3 API Integration

- [ ] Update the fetchSchedules function in api.js:
  ```javascript
  export const fetchSchedules = async (constraints) => {
    try {
      const response = await api.post('/schedules/generate', constraints);
      return response.data;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      throw new Error('Failed to fetch schedules. Please try again later.');
    }
  };
  ```

- [ ] Add loading and error states to the React Query hook:
  ```javascript
  const { data, error, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['schedules', constraints],
    queryFn: () => fetchSchedules(constraints),
    enabled: !!constraints, // Only run query when constraints are provided
  });
  ```

### 10.4 Testing and Refinement

- [ ] Test with various constraint combinations
- [ ] Fix edge cases and unexpected inputs
- [ ] Add helpful prompts and tooltips for better user experience
- [ ] Implement error recovery strategies

### 10.5 Deployment Updates

- [ ] Deploy backend changes to Render
- [ ] Update frontend with new components
- [ ] Test end-to-end flow with real user inputs
- [ ] Gather feedback and iterate on the design

## How to Run the Application

### Running the CLI Interface
To run the command-line interface version of the application:
```bash
# From the project root directory
./run.sh
```
This will start the text-based interface showing the top 10 schedules in the terminal, with auto-refresh every 30 seconds.

### Running the Web Interface
The web interface requires two components to be running:

1. Start the Flask backend (if not already running):
```bash
# From the project root directory
cd backend
source venv/bin/activate
python app.py
```

2. Start the React frontend:
```bash
# From the project root directory
./run_frontend.sh
```

The web interface will automatically connect to the backend running on http://localhost:8000 and display the schedules in a modern web UI.

### Required Files for React Frontend
The React frontend requires these files in the public directory:
- index.html - The main HTML template
- manifest.json - Web app manifest for PWA support
- favicon.ico - Website icon
- robots.txt - Standard robots control file

## 7. Optional Enhancements (if time permits)

- [ ] Add export function to save schedules as CSV
- [ ] Implement simple GUI using Tkinter
- [ ] Add system notifications for schedule changes
- [ ] Create visual calendar view of schedules
- [ ] Allow saving preferred schedules
- [ ] Implement email notifications when ideal schedules become available

## Notes on Implementation

- The system is efficient with website requests to avoid overloading
- Implemented caching to reduce duplicate web requests
- Course time parsing handles various format variations
- When comparing schedules between runs, focuses on changes in availability
- Uses clear, color-coded output to highlight changes
- Code organized into logical components for maintainability

## 8. Web App Dashboard Implementation

### Project Structure Refactoring

Before implementing the web app, the project structure needs to be refactored to fix import issues:

- [x] Reorganize the backend to use a proper Python package structure:
  - [x] Create a `nsu_scheduler` package with proper `__init__.py` files
  - [x] Fix relative imports to use absolute imports
  - [x] Update import paths in all modules
  - [ ] Create a setup.py file for proper package installation

- [x] Simplify the directory structure:
  - [x] Move core modules (scraper.py, filters.py, scheduler.py) into the package
  - [x] Create a proper API structure with Flask Blueprint
  - [x] Ensure configuration is loaded correctly

- [ ] Set up development environment:
  - [x] Create separate requirements files for backend and frontend (May 10, 2025)
  - [x] Set up development scripts for both components (May 10, 2025)
    - [x] run.sh - Script to start the CLI interface (May 10, 2025)
    - [x] run_frontend.sh - Script to start the React web interface (May 10, 2025)
  - [x] Create proper documentation for running the application (May 10, 2025)

**Note:** The project currently maintains two implementations:
1. CLI Interface (in src/) - Working implementation using console output
2. Web API Interface (in backend/) - Flask API version of the same functionality

Both implementations use the same core logic (scraper.py, filters.py, scheduler.py) which has been duplicated between src/ and backend/core/ directories. This allows both interfaces to function independently while we develop the web application.

### Web App Implementation

- [x] Set up a Flask API backend to serve schedule data
- [x] Create a modern React frontend application
- [x] Set up Flask app initialization with CORS support (May 10, 2025)
- [x] Implement the main dashboard page with React components (May 10, 2025)
- [x] Set up auto-refresh using React hooks (every 30 seconds) (May 10, 2025)
- [x] Create API endpoints to provide real-time schedule data (May 10, 2025)
- [x] Implement seat availability highlighting with styled components (May 10, 2025)
- [x] Add timestamp display showing last data refresh time (May 10, 2025)
- [x] Create a responsive table view for schedules using React Table (May 10, 2025)
- [x] Implement day-wise grouping of courses in each schedule (May 10, 2025)
- [x] Add filter controls as React components (May 10, 2025)
- [x] Create a "favorites" feature using browser localStorage (May 10, 2025)
- [ ] Add browser notifications for seat availability changes (Next priority)
- [x] Set up proper error handling and loading states (May 10, 2025)

## Web App Features (Priority Order)

1. **Core Dashboard:**
   - [x] Modern React UI showing available schedules (May 10, 2025)
   - [x] Real-time updates of seat availability (May 10, 2025)
   - [x] Color-coded highlighting of changes since last refresh (May 10, 2025)
   - [x] Warning indicators for sections with low seat counts (≤ 3) (May 10, 2025)

2. **Interactive Schedule View:**
   - [x] React-based tabular display with sorting and filtering (May 10, 2025)
   - [x] Grouping of courses by day for better readability (May 10, 2025)
   - [x] Expandable rows for detailed course information (May 10, 2025)
   - [ ] Optional: Visual calendar representation of schedule

3. **Status Panel:**
   - [x] Last refresh timestamp and auto-refresh countdown (May 10, 2025)
   - [x] Total available schedules and filtering statistics (May 10, 2025)
   - [x] Summary of courses with limited seat availability (May 10, 2025)
   - [x] System status indicators (May 10, 2025)

4. **User Features:**
   - [x] Ability to save favorite schedules locally (May 10, 2025)
   - [ ] Browser notifications when marked schedules change
   - [ ] Customizable refresh rate
   - [x] Filter adjustment controls (May 10, 2025)
   - [x] Toggle for including/excluding evening classes (start time ≥ 6:00 PM) (May 10, 2025) - DONE

## Web App Technical Approach

1. **Backend (Flask API):**
   - [x] Reuse existing scraper, filters, and scheduler modules (May 10, 2025)
   - [x] Create simple REST API endpoints for fetching schedule data (May 10, 2025)
   - [x] Implement caching to reduce load on NSU's website (May 10, 2025)
   - [x] JSON responses with schedule data and metadata (May 10, 2025)

2. **Frontend (React):**
   - [x] Modern React with functional components and hooks (May 10, 2025)
   - [x] Styled-components for styling (May 10, 2025)
   - [x] React Query for data fetching and caching (May 10, 2025)
   - [x] Responsive design for mobile and desktop (May 10, 2025)

3. **Data Flow:**
   - [x] Backend scheduled task fetches data every few minutes (May 10, 2025)
   - [x] React frontend polls API endpoint every 30 seconds (May 10, 2025)
   - [x] State management to track and highlight changes (May 10, 2025)
   - [x] LocalStorage for persisting user preferences (May 10, 2025)

4. **Deployment Strategy:**
   - [ ] Backend: Simple Flask server or serverless function
   - [ ] Frontend: Static site hosting (Netlify, Vercel, or GitHub Pages)
   - [ ] Separate deployments for easier maintenance

Implementation will leverage modern React patterns and hooks to create a clean, responsive UI that clearly displays seat availability changes in real-time while maintaining simplicity.
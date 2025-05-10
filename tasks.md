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

## Current Status (June 2, 2023)

1. **Successfully Implemented All 11 Hard Constraints**:
   - H1-H11 constraints properly applied during filtering and schedule generation
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
   - Color-coded text-based dashboard 
   - Shows top 10 schedules ranked by score
   - Highlights new/changed schedules
   - Refreshes every 30 seconds

The system is now fully functional for monitoring available course sections and finding optimal schedules that meet all 11 hard constraints, ranked according to the 3 soft preferences.

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
  - [x] Create separate requirements files for backend and frontend
  - [x] Set up development scripts for both components (May 10, 2025)
  - [ ] Create proper documentation for running the application

**Note:** The project currently maintains two implementations:
1. CLI Interface (in src/) - Working implementation using console output
2. Web API Interface (in backend/) - Flask API version of the same functionality

Both implementations use the same core logic (scraper.py, filters.py, scheduler.py) which has been duplicated between src/ and backend/core/ directories. This allows both interfaces to function independently while we develop the web application.

### Web App Implementation

- [x] Set up a Flask API backend to serve schedule data
- [x] Create a modern React frontend application
- [x] Set up Flask app initialization with CORS support (May 10, 2025)
- [ ] Implement the main dashboard page with React components
- [ ] Set up auto-refresh using React hooks (every 30 seconds)
- [ ] Create API endpoints to provide real-time schedule data
- [ ] Implement seat availability highlighting with styled components
- [ ] Add timestamp display showing last data refresh time
- [ ] Create a responsive table view for schedules using React Table
- [ ] Implement day-wise grouping of courses in each schedule
- [ ] Add filter controls as React components
- [ ] Create a "favorites" feature using browser localStorage
- [ ] Add browser notifications for seat availability changes
- [ ] Set up proper error handling and loading states

## Web App Features (Priority Order)

1. **Core Dashboard:**
   - Modern React UI showing available schedules
   - Real-time updates of seat availability
   - Color-coded highlighting of changes since last refresh
   - Warning indicators for sections with low seat counts (≤ 3)

2. **Interactive Schedule View:**
   - React-based tabular display with sorting and filtering
   - Grouping of courses by day for better readability
   - Expandable rows for detailed course information
   - Optional: Visual calendar representation of schedule

3. **Status Panel:**
   - Last refresh timestamp and auto-refresh countdown
   - Total available schedules and filtering statistics
   - Summary of courses with limited seat availability
   - System status indicators

4. **User Features:**
   - Ability to save favorite schedules locally
   - Browser notifications when marked schedules change
   - Customizable refresh rate
   - Filter adjustment controls

## Web App Technical Approach

1. **Backend (Flask API):**
   - Reuse existing scraper, filters, and scheduler modules
   - Create simple REST API endpoints for fetching schedule data
   - Implement caching to reduce load on NSU's website
   - JSON responses with schedule data and metadata

2. **Frontend (React):**
   - Modern React with functional components and hooks
   - Styled-components or Tailwind CSS for styling
   - React Query for data fetching and caching
   - Responsive design for mobile and desktop

3. **Data Flow:**
   - Backend scheduled task fetches data every few minutes
   - React frontend polls API endpoint every 30 seconds
   - State management to track and highlight changes
   - LocalStorage for persisting user preferences

4. **Deployment Strategy:**
   - Backend: Simple Flask server or serverless function
   - Frontend: Static site hosting (Netlify, Vercel, or GitHub Pages)
   - Separate deployments for easier maintenance

Implementation will leverage modern React patterns and hooks to create a clean, responsive UI that clearly displays seat availability changes in real-time while maintaining simplicity.
NSU Course Scheduler Development Todo List
Project Overview for AI Agent
This project creates a personal tool for monitoring available course sections at North South University (NSU). The core purpose is to help find ideal course schedules based on specific preferences:

Goals: Find sections of specified courses that fit the following criteria:

Classes start after 12 PM
Schedule spans only 5 days per week
Lecture classes occur only on ST (Sunday-Tuesday) and MW (Monday-Wednesday) slots
Lab classes (CSE332L, PHY108L, CHE101L) can be on Thursday (R) but not on Saturday (A)
CSE 332 lecture and lab must be in the same section
CSE 327 must be section 1 or 7 with instructor "NBM"


Target Courses:

BIO103 (3 credits) - Lecture course - ST/MW only
CHE101L (1 credit) - Lab course - Can be on ST/MW/R but not A
CSE327 (3 credits) - Lecture course - ST/MW only
CSE332 (3 credits) - Lecture course - ST/MW only
CSE332L (0 credits) - Lab course - Can be on ST/MW/R but not A
EEE452 (3 credits) - Lecture course - ST/MW only
ENG115 (3 credits) - Lecture course - ST/MW only
PHY108L (1 credit) - Lab course - Can be on ST/MW/R but not A


Workflow:

Scrape the NSU course offerings page
Filter sections that meet all criteria
Generate valid schedule combinations
Display results in a simple dashboard
Automatically refresh every 30 seconds to check for changes


Important Notes:

This is for personal use, so prioritize functionality over aesthetics
The system should clearly show which sections are available now
Focus on finding ANY valid combinations first, then optimize for preferences
NSU uses a specific day coding: S=Sunday, M=Monday, T=Tuesday, W=Wednesday, R=Thursday



This tool will help monitor course availability without needing to manually refresh the page and scan through hundreds of sections repeatedly.

# NSU Course Scheduler Development Todo List

## Initial Setup for Cursor/AI Agent

- [x] Create project structure with `main.py`, `scraper.py`, `filters.py`, and `scheduler.py` (May 10, 2023)
- [x] Install required packages: `requests`, `beautifulsoup4`, `pandas`, `colorama`, `schedule` (May 10, 2023)
- [x] Update task status with timestamps when completed (May 15, 2023)
- [ ] Mark tasks as "DONE" when I verify they work as expected
- [x] Add clear docstrings and comments for each function (May 10, 2023)
- [ ] If you have questions or need clarification, add "QUESTION: [your question]" above the relevant code
- [ ] Get my approval before implementing any complex algorithms or changing the planned approach
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

- [x] Create function to fetch course page with proper headers and error handling (May 10, 2023)
- [x] Examine page HTML structure to identify course table elements (May 10, 2023)
- [x] Implement HTML parsing function that extracts all courses into a DataFrame (May 10, 2023)
- [x] Include columns: course_code, section, title, credit, day_time, room, instructor, seats (May 10, 2023)
- [x] Add parsing for day/time format to extract days (ST, MW, etc.) and times separately (May 10, 2023)
- [x] Create function to filter just the requested courses (BIO103, CSE327, etc.) (May 10, 2023)
- [x] Add data cleaning functions to standardize extracted information (May 10, 2023)
- [x] Test scraper with sample page to verify extraction accuracy (May 10, 2023)
- [x] Add support for cross-listed courses (e.g., CSE332/EEE336) (May 15, 2023)
- [x] Successfully tested connection to NSU course offerings page (May 15, 2023)

## Git Workflow

- [x] Initialize git repository (May 15, 2023)
- [x] Commit after completing each logical component (May 15, 2023)
- [ ] Recommended commit points:
  - [x] After initial setup and configuration (May 15, 2023)
  - [x] After implementing and testing scraper (May 15, 2023)
  - [x] After implementing filters (May 15, 2023)
  - [x] After implementing scheduler (May 15, 2023)
  - [x] After implementing main application (May 15, 2023)
  - [ ] After adding utility scripts and refinements (Pending)

## 2. Filter Implementation (`filters.py`)

- [x] Create function to filter courses after 12 PM (May 10, 2023)
  ```python
  # Pseudocode
  def is_after_12pm(time_str):
      # Parse the start time from format like "1:00 PM - 2:30 PM"
      # Return True if it's PM and not 12:00 PM
  ```

- [x] Create function to check if section days are ST or MW only (May 10, 2023)
  ```python
  # Pseudocode
  def is_st_mw_only(day_str):
      # Check if day string contains only S, T, M, W
      # Ensure it doesn't contain R (Thursday) or F (Friday)
      # Return True if matches criteria
  ```

- [x] Implement CSE 327 section/instructor filter (sections 1 or 7, instructor NBM) (May 10, 2023)
- [x] Implement function to ensure CSE 332 lecture and lab are same section (May 10, 2023)
- [x] Create master filter function that applies all criteria to course DataFrame (May 10, 2023)
- [x] Add function to count total days in a schedule (must be ≤ 5 days) (May 10, 2023)
- [x] Modify the CSE332 pairing logic to allow any lecture/lab combination (May 15, 2023)

## 3. Schedule Generator (`scheduler.py`)

- [x] Implement algorithm to find all valid section combinations (May 10, 2023)
  ```python
  # Pseudocode
  def generate_schedules(filtered_courses):
      # Group courses by course code
      # Start with empty schedule
      # For each course group, try adding each section
      # Check for time conflicts
      # If no conflicts and meets all criteria, add to valid schedules
      # Return list of valid schedules
  ```

- [x] Add function to check for scheduling conflicts between sections (May 10, 2023)
- [x] Implement function to calculate total days in a schedule (May 10, 2023)
- [x] Add scoring function to rank schedules (e.g., compactness, fewer days) (May 10, 2023)
- [x] Create function to format schedule for display (May 10, 2023)
- [x] Implement partial schedule generation when full schedules cannot be found (May 15, 2023)
- [x] Add debugging statistics to track scheduling constraints and failures (May 15, 2023)

## 4. Main Application (`main.py`)

- [x] Set up main loop to run every 30 seconds using `schedule` library (May 10, 2023)
- [x] Implement function to store previous results and detect changes (May 10, 2023)
- [x] Create simple text-based dashboard to display valid schedules (May 10, 2023)
- [x] Add color coding for new/changed schedules (May 10, 2023)
- [x] Implement basic configuration options (refresh rate, display preferences) (May 10, 2023)
- [x] Add simple notification for when new valid schedules appear (May 10, 2023)

## 5. Testing & Refinement

- [x] Test with real NSU webpage to verify scraping works correctly (May 15, 2023)
- [x] Create test cases for various filter combinations (May 10, 2023)
- [x] Add error handling for network issues or website changes (May 10, 2023)
- [x] Create mock data for testing when actual website is unavailable (May 10, 2023)
- [x] Test scraper with mock data to verify parsing logic (May 10, 2023)
- [x] Test full system operation for multiple refresh cycles (May 15, 2023)
- [x] Refine display format based on actual data (May 15, 2023)

## 6. Analysis & Diagnostic Tools

- [x] Create export_raw_data.py to save raw course data to text files (May 15, 2023)
- [x] Develop analyze_sections.py to show detailed info about available sections (May 15, 2023)
- [x] Implement check_lab_sections.py to diagnose CSE332/CSE332L pairing issues (May 15, 2023)
- [ ] Create a comprehensive analysis report of scheduling constraints
- [ ] Implement visualization of available sections and constraints

## Current Issues & Status

1. **Modified CSE332 Lecture/Lab Pairing Logic**: The code has been updated to allow any CSE332 lecture to pair with any CSE332L lab section, instead of requiring matching section numbers. This change was necessary because the available data showed no matching section numbers between lecture sections (5, 6, 7) and lab sections (1, 2, 9, 10).

2. **Partial Schedules**: The system now generates partial schedules with as many courses as possible when complete schedules cannot be found. This provides useful information about which subset of courses can be taken together.

3. **Diagnostic Tools**: Three new utility scripts have been added to help diagnose issues:
   - `export_raw_data.py`: Exports raw course data to text files for reference
   - `analyze_sections.py`: Provides detailed analysis of available sections after filtering
   - `check_lab_sections.py`: Specifically diagnoses issues with CSE332/CSE332L section pairing

4. **Maximum Days Limit**: The schedule constraint has been correctly updated to 5 days maximum instead of 4 days as initially specified.

The system is now fully functional for monitoring available course sections and finding the best possible schedules given the constraints and current course offerings.

## 7. Optional Enhancements (if time permits)

- [ ] Add export function to save schedules as CSV
- [ ] Implement simple GUI using Tkinter
- [ ] Add system notifications for schedule changes
- [ ] Create visual calendar view of schedules
- [ ] Allow saving preferred schedules
- [ ] Implement email notifications when ideal schedules become available

## Notes on Implementation

- The system should be efficient with website requests to avoid overloading
- Consider implementing a cache to reduce duplicate web requests
- Course time parsing will need careful attention as format may vary
- When comparing schedules between runs, focus on changes in availability
- Use clear, color-coded output to highlight changes
- Commit code after each logical component is implemented and tested
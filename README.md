# NSU Course Scheduler

A tool for monitoring available course sections at North South University (NSU) and finding ideal schedules based on specific preferences.

## Project Overview

This tool helps find sections of specified courses that fit the following criteria:
- Classes start after 12 PM
- Schedule spans only 4 days per week
- Classes occur only on ST (Sunday-Tuesday) and MW (Monday-Wednesday) slots
- CSE 332 lecture and lab must be in the same section
- CSE 327 must be section 1 or 7 with instructor "NBM"

## Target Courses

- BIO 103 (3 credits)
- CSE 327 (3 credits)
- CSE 332 (3 credits)
- EEE 452 (3 credits)
- ENG 115 (3 credits)
- PHY108L (1 credit)
- CHE101L (1 credit)

## Features

- Automatically scrapes the NSU course offerings page
- Filters sections based on specified criteria
- Generates valid schedule combinations
- Displays results in a simple dashboard
- Refreshes every 30 seconds to check for changes
- Highlights new or changed schedules

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/nsu-course-scheduler.git
   cd nsu-course-scheduler
   ```

2. Install required packages:
   ```
   pip install -r requirements.txt
   ```

## Usage

Run the main application:

```
python src/main.py
```

The application will start monitoring course sections and display valid schedules in the console.

## Project Structure

```
nsu-course-scheduler/
├── config/
│   └── settings.py      # Configuration settings
├── data/                # Directory for storing/caching data
├── src/
│   ├── main.py          # Main application entry point
│   ├── scraper.py       # Web scraping module
│   ├── filters.py       # Filter implementation
│   └── scheduler.py     # Schedule generator
├── tests/               # Test directory
├── requirements.txt     # Required packages
└── README.md            # This file
```

## Configuration

You can modify the settings in `config/settings.py` to adjust:
- Target courses
- Filtering criteria
- Refresh interval
- Display preferences

## Note on NSU Day Coding

NSU uses a specific day coding in their schedule:
- S = Sunday
- M = Monday
- T = Tuesday
- W = Wednesday
- R = Thursday
- F = Friday

## License

This project is for personal use only. 
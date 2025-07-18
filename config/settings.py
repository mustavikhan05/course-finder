#!/usr/bin/env python3
"""
NSU Course Scheduler - Configuration Settings

This module contains configuration settings for the NSU Course Scheduler application.
"""

# URL for the NSU course offerings page
NSU_COURSE_URL = "https://rds2.northsouth.edu/index.php/common/showofferedcourses"

# Target courses to monitor
TARGET_COURSES = [
    "BIO103",
    "CHE101L",
    "CSE327",
    "CSE332",
    "CSE332L",
    "EEE452",
    "ENG115",
    "PHY108L"
]

# Filtering criteria
MINIMUM_START_TIME = "11:00 AM"  # Only consider classes after this time
MAX_DAYS_PER_WEEK = 5  # Maximum number of days in a valid schedule
VALID_DAY_PATTERNS = ["ST", "MW", "S", "M", "T", "W"]  # Valid day combinations

# CSE 327 specific criteria
CSE327_VALID_SECTIONS = ["1", "7"]
CSE327_INSTRUCTOR = "NBM"

# Refresh interval in seconds
REFRESH_INTERVAL = 30

# Display settings
SHOW_ROOM_INFO = True
SHOW_SECTION_INFO = True
HIGHLIGHT_NEW_SCHEDULES = True

# HTTP request settings
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_TIMEOUT = 10
REQUEST_DELAY_MIN = 0.5  # Minimum delay between requests (seconds)
REQUEST_DELAY_MAX = 1.5  # Maximum delay between requests (seconds)

# Cache settings
CACHE_ENABLED = True
CACHE_FILE = "data/latest_courses.csv"
CACHE_EXPIRY = 300  # Cache expiry in seconds (5 minutes) 
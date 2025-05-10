"""
NSU Course Scheduler - Configuration Settings
This is a dedicated settings file for the backend Flask application.
"""

# URL for the NSU course offerings page
NSU_COURSE_URL = "https://rds2.northsouth.edu/index.php/common/showofferedcourses"

# Refresh interval in seconds
REFRESH_INTERVAL = 30

# Display settings
MAX_SCHEDULES_TO_DISPLAY = 10

# Request settings
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_TIMEOUT = 60  # seconds - Increased from 30 to 60 for slower connections
REQUEST_DELAY_MIN = 1.0  # seconds
REQUEST_DELAY_MAX = 3.0  # seconds

# For compatibility with backend code
COURSE_URL = NSU_COURSE_URL 
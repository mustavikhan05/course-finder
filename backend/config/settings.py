"""
NSU Course Scheduler - Configuration Settings
This is a dedicated settings file for the backend Flask application.
"""

# URL for the NSU course offerings page
NSU_COURSE_URL = "https://rds2.northsouth.edu/index.php/common/showofferedcourses"

# Structured target courses for the filter function
STRUCTURED_TARGET_COURSES = {
    'lectures': [
        'BIO103',
        'CSE327',
        'CSE332',
        'EEE452',
        'ENG115'
    ],
    'labs': [
        'CHE101L',
        'PHY108L',
        'CSE332L'
    ],
    'special': {
        'cse332': 'CSE332',
        'cse332l': 'CSE332L'
    }
}

# Flattened target courses
TARGET_COURSES = []
TARGET_COURSES.extend(STRUCTURED_TARGET_COURSES['lectures'])
TARGET_COURSES.extend(STRUCTURED_TARGET_COURSES['labs'])

# Instructor constraints
CSE327_INSTRUCTORS = ['NBM']

# Refresh interval in seconds
REFRESH_INTERVAL = 30

# Display settings
MAX_SCHEDULES_TO_DISPLAY = 10

# Request settings
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_TIMEOUT = 30  # seconds
REQUEST_DELAY_MIN = 1.0  # seconds
REQUEST_DELAY_MAX = 3.0  # seconds

# For compatibility with backend code
COURSE_URL = NSU_COURSE_URL 
"""
NSU Course Scheduler - API Routes
This module defines the API routes for the Flask backend.
"""

from flask import Blueprint, jsonify, current_app, request
from flask_cors import cross_origin
import time
import sys
import os

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.scraper import fetch_course_data
from core.filters import apply_filters
from core.scheduler import generate_schedules, score_schedule

# Create a blueprint for the API
api_bp = Blueprint('api', __name__)

# Store previous results for change detection
previous_schedules = {"with_evening": [], "without_evening": []}
last_update_time = 0

def process_schedules(valid_schedules, previous):
    """
    Process and format schedules for API response.
    
    Args:
        valid_schedules (list): List of valid schedules
        previous (list): Previously returned schedules for comparison
        
    Returns:
        list: Processed schedules ready for API response
    """
    # Sort schedules by score (higher is better)
    sorted_schedules = sorted(valid_schedules, key=lambda x: -score_schedule(x))
    
    # Get top 10 schedules (or fewer if less available)
    display_count = min(10, len(sorted_schedules))
    top_schedules = sorted_schedules[:display_count]
    
    # Process schedules for the response
    result_schedules = []
    for i, schedule in enumerate(top_schedules):
        # Check if this is a new schedule compared to previous run
        is_new = False
        if previous and i < len(previous):
            if set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in schedule) != \
               set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in previous[i]):
                is_new = True
        
        # Add to result
        processed_schedule = []
        for course in schedule:
            processed_schedule.append({
                'course_code': course['course_code'],
                'section': course['section'],
                'title': course['title'],
                'credit': course['credit'],
                'days': course['days'],
                'start_time': course['start_time'],
                'end_time': course['end_time'],
                'room': course['room'],
                'instructor': course['instructor'],
                'seats': course['seats']
            })
        
        result_schedules.append({
            'courses': processed_schedule,
            'is_new': is_new,
            'score': score_schedule(schedule)
        })
    
    return top_schedules, result_schedules

@api_bp.route('/schedules', methods=['GET'])
@cross_origin()
def get_schedules():
    """
    Get all valid schedules that meet the constraints.
    Returns a JSON response with two sets of schedules:
    1. Including evening classes (starting at or after 6:00 PM)
    2. Excluding evening classes
    
    Also includes metadata and statistics.
    """
    global previous_schedules, last_update_time
    
    try:
        # Fetch course data
        courses_df = fetch_course_data()
        
        # Generate schedules WITH evening classes (default behavior)
        filtered_df_with_evening = apply_filters(courses_df, exclude_evening_classes=False)
        valid_schedules_with_evening = generate_schedules(filtered_df_with_evening)
        
        # Process schedules with evening classes
        prev_with_evening = previous_schedules.get("with_evening", [])
        top_with_evening, result_with_evening = process_schedules(
            valid_schedules_with_evening, 
            prev_with_evening
        )
        
        # Generate schedules WITHOUT evening classes
        filtered_df_without_evening = apply_filters(courses_df, exclude_evening_classes=True)
        valid_schedules_without_evening = generate_schedules(filtered_df_without_evening)
        
        # Process schedules without evening classes
        prev_without_evening = previous_schedules.get("without_evening", [])
        top_without_evening, result_without_evening = process_schedules(
            valid_schedules_without_evening,
            prev_without_evening
        )
        
        # Update stored data for next comparison
        previous_schedules = {
            "with_evening": top_with_evening,
            "without_evening": top_without_evening
        }
        
        current_time = time.time()
        last_update_time = current_time
        
        # Return JSON response with both sets of schedules
        return jsonify({
            'schedules': {
                'with_evening': result_with_evening,
                'without_evening': result_without_evening
            },
            'total_found': {
                'with_evening': len(valid_schedules_with_evening),
                'without_evening': len(valid_schedules_without_evening)
            },
            'timestamp': current_time,
            'stats': {
                'courses_fetched': len(courses_df),
                'courses_after_filtering': {
                    'with_evening': len(filtered_df_with_evening),
                    'without_evening': len(filtered_df_without_evening)
                }
            }
        })
        
    except Exception as e:
        error_msg = str(e)
        if 'timeout' in error_msg.lower() or 'connection' in error_msg.lower():
            error_msg = f"Cannot connect to NSU's course system. The university website may be offline during nighttime hours (typically after 12 AM Bangladesh time). Please try again during daytime hours. Error details: {error_msg}"
        
        return jsonify({
            'error': error_msg,
            'timestamp': time.time()
        }), 503  # Service Unavailable

@api_bp.route('/schedules/generate', methods=['POST'])
@cross_origin()
def generate_custom_schedules():
    """
    Generate schedules based on custom constraints provided in the request.
    
    Request body should contain:
    {
        "required_courses": ["BIO103", "CSE327", ...],
        "start_time_constraint": "11:00 AM",  # Minimum start time for lectures
        "day_pattern": ["ST", "MW"],          # Allowed day patterns
        "exclude_evening_classes": true,      # Whether to exclude classes after 6 PM
        "max_days": 5,                        # Maximum allowed distinct days
        "instructor_preferences": {           # Course-specific instructor preferences
            "CSE327": "NBM"
        }
    }
    
    Returns JSON response with generated schedules based on provided constraints.
    """
    try:
        # Get request data
        data = request.json
        if not data:
            return jsonify({
                'error': 'No data provided',
                'timestamp': time.time()
            }), 400
        
        # Extract constraints with defaults if not provided
        required_courses = data.get('required_courses', [])
        start_time_constraint = data.get('start_time_constraint', '11:00 AM')
        day_pattern = data.get('day_pattern', ['ST', 'MW'])
        exclude_evening_classes = data.get('exclude_evening_classes', False)
        max_days = data.get('max_days', 5)
        instructor_preferences = data.get('instructor_preferences', {})
        
        # Validate required courses
        if not required_courses:
            return jsonify({
                'error': 'No required courses specified',
                'timestamp': time.time()
            }), 400
        
        # Fetch course data
        courses_df = fetch_course_data()
        
        # Filter courses based on user constraints
        filtered_df = apply_filters(
            courses_df, 
            exclude_evening_classes=exclude_evening_classes,
            custom_constraints={
                'required_courses': required_courses,
                'start_time_constraint': start_time_constraint,
                'day_pattern': day_pattern,
                'max_days': max_days,
                'instructor_preferences': instructor_preferences
            }
        )
        
        # Generate schedules with custom constraints
        valid_schedules = generate_schedules(filtered_df, max_days=max_days)
        
        # Process schedules
        _, result_schedules = process_schedules(valid_schedules, [])
        
        # Return JSON response
        return jsonify({
            'schedules': result_schedules,
            'total_found': len(valid_schedules),
            'timestamp': time.time(),
            'stats': {
                'courses_fetched': len(courses_df),
                'courses_after_filtering': len(filtered_df)
            },
            'constraints': {
                'required_courses': required_courses,
                'start_time_constraint': start_time_constraint,
                'day_pattern': day_pattern,
                'exclude_evening_classes': exclude_evening_classes,
                'max_days': max_days,
                'instructor_preferences': instructor_preferences
            }
        })
        
    except Exception as e:
        error_msg = str(e)
        status_code = 503  # Service Unavailable
        
        # Customize error message based on error type
        if 'timeout' in error_msg.lower() or 'connection' in error_msg.lower():
            error_msg = f"Cannot connect to NSU's course system. The university website may be offline during nighttime hours (typically after 12 AM Bangladesh time). Please try again during daytime hours. Error details: {error_msg}"
        elif 'memory' in error_msg.lower():
            error_msg = f'Server memory error while processing request. Try simplifying your constraints. Details: {error_msg}'
            status_code = 500
        
        return jsonify({
            'error': error_msg,
            'timestamp': time.time()
        }), status_code

@api_bp.route('/status', methods=['GET'])
@cross_origin()
def get_status():
    """
    Get the current status of the scheduler system.
    Returns last update time and system status.
    """
    return jsonify({
        'last_update': last_update_time,
        'status': 'online',
        'version': '1.0.0'
    })

@api_bp.route('/available_courses', methods=['GET'])
@cross_origin()
def get_available_courses():
    """
    Get all available courses and their instructors from the scraped data.
    This endpoint is used by the frontend to populate course and instructor dropdowns.
    """
    try:
        # Fetch course data
        courses_df = fetch_course_data()
        
        # Process the data to extract unique courses and their instructors
        courses_with_instructors = {}
        
        # Group by course_code
        grouped = courses_df.groupby('course_code')
        
        for course_code, group in grouped:
            # Clean the course code (remove spaces)
            clean_code = course_code.replace(' ', '')
            
            # Get unique instructors for this course
            instructors = group['instructor'].unique().tolist()
            
            # Create entry with course details and instructors
            courses_with_instructors[clean_code] = {
                'title': group.iloc[0]['title'] if 'title' in group else '',
                'credit': group.iloc[0]['credit'] if 'credit' in group else '',
                'instructors': instructors
            }
        
        # Return as JSON
        return jsonify({
            'courses': courses_with_instructors,
            'timestamp': time.time()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': time.time()
        }), 500 
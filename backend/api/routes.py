"""
NSU Course Scheduler - API Routes
This module defines the API routes for the Flask backend.
"""

from flask import Blueprint, jsonify, current_app
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
        return jsonify({
            'error': str(e),
            'timestamp': time.time()
        }), 500

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
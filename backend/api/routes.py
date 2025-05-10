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
previous_schedules = []
last_update_time = 0

@api_bp.route('/schedules', methods=['GET'])
@cross_origin()
def get_schedules():
    """
    Get all valid schedules that meet the constraints.
    Returns a JSON response with schedules, metadata, and statistics.
    """
    global previous_schedules, last_update_time
    
    try:
        # Fetch and process course data
        courses_df = fetch_course_data()
        filtered_df = apply_filters(courses_df)
        valid_schedules = generate_schedules(filtered_df)
        
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
            if previous_schedules and i < len(previous_schedules):
                if set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in schedule) != \
                   set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in previous_schedules[i]):
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
        
        # Update stored data for next comparison
        previous_schedules = top_schedules
        current_time = time.time()
        last_update_time = current_time
        
        # Return JSON response
        return jsonify({
            'schedules': result_schedules,
            'total_found': len(valid_schedules),
            'timestamp': current_time,
            'stats': {
                'courses_fetched': len(courses_df),
                'courses_after_filtering': len(filtered_df)
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
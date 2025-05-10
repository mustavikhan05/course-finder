#!/usr/bin/env python3
"""
Test script for the dynamic schedule generation API
"""

import requests
import json
import time

def test_generate_schedules():
    """
    Test the dynamic schedule generation API by sending a POST request
    with custom constraints.
    """
    # API endpoint URL - change to your actual endpoint
    api_url = "http://localhost:8000/api/schedules/generate"
    
    # Example request payload with custom constraints
    payload = {
        "required_courses": ["BIO103", "CSE327", "CSE332", "EEE452", "ENG115", "CHE101L", "PHY108L"],
        "start_time_constraint": "11:00 AM",
        "day_pattern": ["ST", "MW"],
        "exclude_evening_classes": True,
        "max_days": 5,
        "instructor_preferences": {
            "CSE327": "NBM"
        }
    }
    
    # Print request details
    print(f"Sending POST request to {api_url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        # Send POST request to API
        start_time = time.time()
        response = requests.post(api_url, json=payload)
        end_time = time.time()
        
        # Print status code and execution time
        print(f"Status Code: {response.status_code}")
        print(f"Execution Time: {end_time - start_time:.2f} seconds")
        
        # Parse and print response
        if response.status_code == 200:
            data = response.json()
            print(f"\nTotal Schedules Found: {data['total_found']}")
            
            # Print course counts before/after filtering
            print(f"Total Courses Fetched: {data['stats']['courses_fetched']}")
            print(f"Courses After Filtering: {data['stats']['courses_after_filtering']}")
            
            # Print the first schedule if available
            if data['schedules'] and len(data['schedules']) > 0:
                first_schedule = data['schedules'][0]
                print("\nFirst Schedule:")
                print(f"Score: {first_schedule['score']}")
                print("\nCourses:")
                for course in first_schedule['courses']:
                    print(f"  {course['course_code']} (Section {course['section']}) - "
                          f"{course['days']} {course['start_time']} - {course['end_time']} - "
                          f"Instructor: {course['instructor']} - "
                          f"Seats: {course['seats']}")
            else:
                print("\nNo schedules found.")
        else:
            print(f"Error: {response.text}")
    
    except Exception as e:
        print(f"Exception occurred: {e}")

if __name__ == "__main__":
    test_generate_schedules() 
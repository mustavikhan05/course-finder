#!/usr/bin/env python3
"""
NSU Course Scheduler - Schedule Generator Module

This module is responsible for generating valid schedule combinations from
filtered course sections, ensuring they meet all criteria and have no time conflicts.
"""

import pandas as pd
from itertools import product
from filters import has_same_section_cse332, count_days_in_schedule

def generate_schedules(filtered_df):
    """
    Generate all valid schedule combinations from filtered course sections.
    
    Args:
        filtered_df (pandas.DataFrame): DataFrame with filtered course sections
    
    Returns:
        list: List of valid schedule combinations
    """
    # Group courses by course code to handle separately
    grouped = filtered_df.groupby('course_code')
    
    # Create a dictionary of course options
    course_options = {}
    for course_code, group in grouped:
        # Convert group DataFrame to list of dictionaries
        course_options[course_code] = group.to_dict('records')
    
    # For CSE 332, ensure lecture and lab are in the correct format
    process_cse332_sections(course_options)
    
    # Generate all possible combinations
    valid_schedules = []
    
    # Get all course codes
    course_codes = list(course_options.keys())
    
    # Use recursive approach to build schedules
    generate_schedule_recursive(course_codes, 0, {}, course_options, valid_schedules)
    
    return valid_schedules

def process_cse332_sections(course_options):
    """
    Process CSE 332 sections to ensure lecture and lab are properly handled.
    This function modifies the course_options dictionary in place.
    
    Args:
        course_options (dict): Dictionary mapping course codes to lists of section options
    """
    # Find CSE 332 courses
    cse332_courses = [code for code in course_options.keys() if code.startswith('CSE 332')]
    
    if len(cse332_courses) <= 1:
        # Nothing to process
        return
    
    # Group sections by section number
    section_groups = {}
    for course in cse332_courses:
        for section in course_options[course]:
            section_number = section['section']
            if section_number not in section_groups:
                section_groups[section_number] = {}
            
            section_groups[section_number][course] = section
    
    # Look for complete pairs (lecture + lab) with the same section
    complete_sections = {}
    for section_number, courses in section_groups.items():
        if len(courses) == len(cse332_courses):  # We have all parts
            complete_sections[section_number] = courses
    
    # Update course_options with paired sections
    for course in cse332_courses:
        course_options[course] = [
            sections[course] for section_number, sections in complete_sections.items()
        ]

def generate_schedule_recursive(course_codes, index, current_schedule, course_options, valid_schedules):
    """
    Recursively generate valid schedules by trying different course sections.
    
    Args:
        course_codes (list): List of course codes to schedule
        index (int): Current index in course_codes list
        current_schedule (dict): Current partial schedule being built
        course_options (dict): Dictionary mapping course codes to lists of section options
        valid_schedules (list): List to collect valid complete schedules
    """
    # Base case: we've assigned all courses
    if index == len(course_codes):
        # Convert to list of courses
        schedule = list(current_schedule.values())
        
        # Check total days constraint
        if count_days_in_schedule(schedule) <= 4:
            # Check if CSE 332 lecture and lab have same section
            if has_same_section_cse332(schedule):
                valid_schedules.append(schedule)
        return
    
    # Get current course code and its options
    current_code = course_codes[index]
    options = course_options[current_code]
    
    # Try each option for the current course
    for option in options:
        # Check if this option conflicts with any course already in the schedule
        if not has_conflict(option, current_schedule.values()):
            # Add this option to the schedule
            current_schedule[current_code] = option
            
            # Recurse to the next course
            generate_schedule_recursive(
                course_codes, index + 1, current_schedule, 
                course_options, valid_schedules
            )
            
            # Backtrack
            del current_schedule[current_code]

def has_conflict(course1, other_courses):
    """
    Check if a course has a time conflict with any course in a list.
    
    Args:
        course1 (dict): Course to check for conflicts
        other_courses (list): List of courses to check against
    
    Returns:
        bool: True if there's a conflict, False otherwise
    """
    for course2 in other_courses:
        if has_time_conflict(course1, course2):
            return True
    return False

def has_time_conflict(course1, course2):
    """
    Check if two courses have overlapping days and times.
    
    Args:
        course1 (dict): First course
        course2 (dict): Second course
    
    Returns:
        bool: True if there's a time conflict, False otherwise
    """
    # Check for day overlap
    days1 = course1['days']
    days2 = course2['days']
    
    # If no overlap in days, there's no conflict
    if not any(day in days2 for day in days1):
        return False
    
    # Parse times
    start1 = parse_time(course1['start_time'])
    end1 = parse_time(course1['end_time'])
    start2 = parse_time(course2['start_time'])
    end2 = parse_time(course2['end_time'])
    
    # Check for time overlap
    return not (end1 <= start2 or end2 <= start1)

def parse_time(time_str):
    """
    Parse a time string into a comparable format.
    
    Args:
        time_str (str): Time string like "1:00 PM"
    
    Returns:
        float: Time as a float (e.g., 13.0 for 1:00 PM)
    """
    if not time_str or pd.isna(time_str):
        return 0.0
    
    try:
        # Split time components
        time_parts = time_str.split(':')
        hour = int(time_parts[0])
        
        # Extract minutes and AM/PM
        minutes_part = time_parts[1] if len(time_parts) > 1 else "0"
        minutes_parts = minutes_part.split()
        minutes = int(minutes_parts[0])
        am_pm = minutes_parts[1] if len(minutes_parts) > 1 else "AM"
        
        # Convert to 24-hour format
        if am_pm == "PM" and hour < 12:
            hour += 12
        elif am_pm == "AM" and hour == 12:
            hour = 0
        
        # Convert to decimal hours (e.g., 1:30 PM -> 13.5)
        return hour + minutes / 60.0
    
    except:
        return 0.0

def score_schedule(schedule):
    """
    Score a schedule based on preferences (lower is better).
    
    Args:
        schedule (list): List of courses in a schedule
    
    Returns:
        float: Score value
    """
    score = 0
    
    # Prefer fewer days
    num_days = count_days_in_schedule(schedule)
    score += num_days * 10
    
    # Prefer later start times
    earliest_start = min(parse_time(course['start_time']) for course in schedule)
    score += (15 - earliest_start) * 5 if earliest_start < 15 else 0
    
    # Prefer more compact schedules (less time between classes)
    # TODO: Implement more sophisticated compactness scoring
    
    return score

def format_schedule(schedule):
    """
    Format a schedule for display.
    
    Args:
        schedule (list): List of courses in a schedule
    
    Returns:
        str: Formatted schedule string
    """
    # Sort by day and time
    sorted_schedule = sorted(
        schedule, 
        key=lambda x: (x['days'], parse_time(x['start_time']))
    )
    
    result = []
    for course in sorted_schedule:
        course_str = (
            f"{course['course_code']} (Section {course['section']}) - "
            f"{course['title']} ({course['credit']} cr) - "
            f"{course['days']} {course['start_time']} - {course['end_time']} - "
            f"{course['instructor']} - Room {course['room']}"
        )
        result.append(course_str)
    
    days = count_days_in_schedule(schedule)
    result.append(f"Total days: {days}")
    
    return "\n".join(result)

if __name__ == "__main__":
    # For testing
    import pandas as pd
    from filters import apply_filters
    
    # Create test data
    test_data = {
        'course_code': ['CSE 327', 'CSE 327', 'CSE 332', 'CSE 332', 'BIO 103'],
        'section': ['1', '2', '3', '3', '5'],
        'title': ['Software Engineering', 'Software Engineering', 'Computer Architecture', 'Computer Architecture Lab', 'Biology'],
        'credit': ['3', '3', '3', '1', '3'],
        'day_time': ['ST 1:00 PM - 2:30 PM', 'MW 3:00 PM - 4:30 PM', 'ST 2:00 PM - 3:30 PM', 'W 2:00 PM - 5:00 PM', 'MT 11:00 AM - 12:30 PM'],
        'room': ['NAC 723', 'SAC 607', 'NAC 824', 'NAC 824', 'SAC 507'],
        'instructor': ['NBM', 'TBA', 'TBA', 'TBA', 'TBA'],
        'seats': ['35', '40', '45', '45', '30'],
        'days': ['ST', 'MW', 'ST', 'W', 'MT'],
        'start_time': ['1:00 PM', '3:00 PM', '2:00 PM', '2:00 PM', '11:00 AM'],
        'end_time': ['2:30 PM', '4:30 PM', '3:30 PM', '5:00 PM', '12:30 PM']
    }
    
    test_df = pd.DataFrame(test_data)
    filtered_df = apply_filters(test_df)
    
    schedules = generate_schedules(filtered_df)
    print(f"Found {len(schedules)} valid schedules")
    
    if schedules:
        print("First valid schedule:")
        print(format_schedule(schedules[0])) 
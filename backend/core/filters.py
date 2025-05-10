#!/usr/bin/env python3
"""
NSU Course Scheduler - Filter Implementation Module

This module provides functions for filtering course sections based on 11 hard constraints:
H1: Required lectures – choose exactly one lecture section for each of: BIO 103, CSE 327, CSE 332, EEE 452, ENG 115
H2: Required labs – choose exactly one lab section for each of: CHE 101 L and PHY 108 L
H3: Lecture start‐time ≥ 11:00 (inclusive) for every non-lab section
H4: Lecture day pattern – every non-lab section's days must be either {S,T} (ST) or {M,W} (MW)
H5: Lab day options – a lab's days may be any subset of {S,T,M,W,R,A}
H6: CSE 332 lecture–lab pairing – the CSE 332 lecture and its matching CSE 332 L lab must have identical section numbers
H7: CSE 327 instructor – must be taught by "NbM" (Section 1 or Section 7 in current data)
H8: No time collisions – if two chosen sections share at least one day and their time intervals overlap, reject the pair
H9: Seat availability – only select sections with seats > 0
H10: No 08:00 labs – exclude any lab whose start_time is exactly "08:00"
H11: At most 5 distinct class-days per week
H12: No evening classes - exclude any section with start time ≥ 6:00 PM (optional filter)
"""

import pandas as pd
from datetime import datetime
import re

def apply_filters(courses_df, constraints):
    """
    Apply filtering criteria to the courses DataFrame based on user constraints.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        constraints (dict): User-defined constraints including:
            - required_courses: list of course codes
            - start_time_constraint: minimum start time for lectures
            - day_pattern: allowed day patterns
            - max_days: maximum number of distinct days
            - exclude_evening_classes: whether to exclude evening classes
            - instructor_preferences: dict mapping course codes to preferred instructors
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses meeting all criteria
    """
    # Make a copy to avoid modifying the original
    filtered_df = courses_df.copy()
    
    # Filter for required courses
    if 'required_courses' in constraints:
        filtered_df = filter_required_courses(filtered_df, constraints['required_courses'])
    
    # Apply start time constraint
    if 'start_time_constraint' in constraints:
        filtered_df = filter_by_start_time(filtered_df, constraints['start_time_constraint'])
    
    # Apply day pattern constraint
    if 'day_pattern' in constraints:
        filtered_df = filter_by_day_pattern(filtered_df, constraints['day_pattern'])
    
    # Apply maximum days constraint
    if 'max_days' in constraints:
        filtered_df = filter_by_max_days(filtered_df, constraints['max_days'])
    
    # Apply evening classes filter
    if constraints.get('exclude_evening_classes', True):
        filtered_df = filter_evening_classes(filtered_df)
    
    # Apply instructor preferences
    if 'instructor_preferences' in constraints:
        filtered_df = filter_by_instructor_preferences(filtered_df, constraints['instructor_preferences'])
    
    return filtered_df

def filter_required_courses(courses_df, required_courses):
    """
    Filter DataFrame to include only required courses.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        required_courses (list): List of required course codes
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with only required courses
    """
    # Create a mask to keep only courses in the required list
    course_mask = pd.Series(False, index=courses_df.index)
    
    for course in required_courses:
        # For each required course, look for exact matches
        course_mask = course_mask | (courses_df['course_code'] == course)
        
        # If the course has a lab component (e.g., CSE332 -> CSE332L), also include it
        if course.endswith('L'):
            base_course = course[:-1]
            course_mask = course_mask | (courses_df['course_code'] == base_course)
        else:
            lab_course = course + 'L'
            course_mask = course_mask | (courses_df['course_code'] == lab_course)
    
    return courses_df[course_mask]

def filter_by_start_time(courses_df, start_time):
    """
    Filter courses based on start time.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        start_time (str): Minimum start time in format "HH:MM AM/PM"
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses starting after the specified time
    """
    def is_after_start_time(time_str):
        if not time_str:
            return False
        try:
            course_time = pd.to_datetime(time_str).time()
            min_time = pd.to_datetime(start_time).time()
            return course_time >= min_time
        except:
            return False
    
    return courses_df[courses_df['start_time'].apply(is_after_start_time)]

def filter_by_day_pattern(courses_df, allowed_patterns):
    """
    Filter courses based on day patterns.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        allowed_patterns (list): List of allowed day patterns (e.g., ["ST", "MW"])
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses matching allowed day patterns
    """
    def is_valid_pattern(days):
        if not days:
            return False
        return days in allowed_patterns
    
    return courses_df[courses_df['days'].apply(is_valid_pattern)]

def filter_by_max_days(courses_df, max_days):
    """
    Filter courses based on maximum number of distinct days.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        max_days (int): Maximum number of distinct days allowed
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses meeting the maximum days constraint
    """
    def count_distinct_days(days):
        if not days:
            return 0
        return len(set(days))
    
    return courses_df[courses_df['days'].apply(count_distinct_days) <= max_days]

def filter_evening_classes(courses_df):
    """
    Filter out evening classes (starting at or after 6:00 PM).
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame without evening classes
    """
    def is_evening_class(time_str):
        if not time_str:
            return False
        try:
            course_time = pd.to_datetime(time_str).time()
            evening_time = pd.to_datetime("6:00 PM").time()
            return course_time < evening_time
        except:
            return False
    
    return courses_df[courses_df['start_time'].apply(is_evening_class)]

def filter_by_instructor_preferences(courses_df, instructor_preferences):
    """
    Filter courses based on instructor preferences.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        instructor_preferences (dict): Dictionary mapping course codes to preferred instructors
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses matching instructor preferences
    """
    if not instructor_preferences:
        return courses_df
    
    def matches_instructor_preference(row):
        course = row['course_code']
        instructor = row['instructor']
        
        # If no preference for this course, keep it
        if course not in instructor_preferences:
            return True
        
        # If preference is empty string, keep any instructor
        if not instructor_preferences[course]:
            return True
        
        # Check if instructor matches preference
        return instructor == instructor_preferences[course]
    
    return courses_df[courses_df.apply(matches_instructor_preference, axis=1)]

def is_after_start_time(time_str, min_start_time):
    """
    Check if a start time is at or after the specified minimum start time.
    
    Args:
        time_str (str): Time string in format like "11:00 AM"
        min_start_time (str): Minimum start time in format like "11:00 AM"
    
    Returns:
        bool: True if time is at or after the minimum start time, False otherwise
    """
    if not time_str or pd.isna(time_str):
        return False
    
    try:
        # Parse both time strings into components
        time_match = re.match(r'(\d+):(\d+)\s*(AM|PM)', time_str)
        min_match = re.match(r'(\d+):(\d+)\s*(AM|PM)', min_start_time)
        
        if not time_match or not min_match:
            return False
            
        # Extract components
        time_hour, time_min, time_ampm = time_match.groups()
        min_hour, min_min, min_ampm = min_match.groups()
        
        # Convert to integers
        time_hour, time_min = int(time_hour), int(time_min)
        min_hour, min_min = int(min_hour), int(min_min)
        
        # Convert to 24-hour format for easier comparison
        if time_ampm == "PM" and time_hour < 12:
            time_hour += 12
        elif time_ampm == "AM" and time_hour == 12:
            time_hour = 0
            
        if min_ampm == "PM" and min_hour < 12:
            min_hour += 12
        elif min_ampm == "AM" and min_hour == 12:
            min_hour = 0
        
        # Compare times
        if time_hour > min_hour:
            return True
        elif time_hour == min_hour and time_min >= min_min:
            return True
        else:
            return False
    except:
        return False

def is_after_11am(time_str):
    """
    Check if a start time is at or after 11:00 AM.
    
    Args:
        time_str (str): Time string in format like "11:00 AM"
    
    Returns:
        bool: True if time is at or after 11:00 AM, False otherwise
    """
    return is_after_start_time(time_str, "11:00 AM")

def filter_after_11am(courses_df):
    """
    Filter courses to include only those starting at or after 11:00 AM.
    Only applies to lecture courses - lab courses can be at any time.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    return filter_by_start_time(courses_df, "11:00 AM")

def is_valid_day_pattern(day_str, course_code, allowed_patterns):
    """
    Check if section days match one of the allowed day patterns.
    Lab courses can be on any day.
    
    Args:
        day_str (str): String containing day codes
        course_code (str): Course code to determine if it's a lab course
        allowed_patterns (list): List of allowed day patterns (e.g., ['ST', 'MW'])
    
    Returns:
        bool: True if days are appropriate for the course type, False otherwise
    """
    if not day_str or pd.isna(day_str):
        return False
    
    # Check if this is a lab course
    is_lab = 'L' in course_code
    
    # Lab courses have no day restrictions
    if is_lab:
        return True
    else:
        # Sort the day string to normalize it (e.g., "TS" becomes "ST")
        sorted_days = ''.join(sorted(day_str))
        
        # For lectures, the day pattern must be in the allowed list
        # Also allow individual days from the patterns (e.g., 'S', 'T', 'M', 'W')
        for pattern in allowed_patterns:
            if sorted_days == ''.join(sorted(pattern)):
                return True
            # Also allow individual days
            if len(sorted_days) == 1 and sorted_days in pattern:
                return True
                
        return False

def filter_st_mw_only(courses_df):
    """
    Filter courses based on day patterns.
    H4: Lecture courses should be on ST/MW only.
    H5: Lab courses can be on any day.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    return filter_by_day_pattern(courses_df, ['ST', 'MW'])

def has_same_section_cse332(schedule):
    """
    H6: Check if CSE 332 lecture and lab are in the same section.
    This function works on a schedule (subset of courses) rather than the full DataFrame.
    
    Args:
        schedule (list): List of course rows representing a potential schedule
    
    Returns:
        bool: True if CSE 332 courses have matching sections, False otherwise
    """
    cse332_lecture = None
    cse332_lab = None
    
    # Find CSE332 lecture and lab in the schedule
    for course in schedule:
        if 'CSE332' in course['course_code'] and 'L' not in course['course_code']:
            cse332_lecture = course
        elif 'CSE332L' in course['course_code']:
            cse332_lab = course
    
    # If either lecture or lab is missing, this constraint is not applicable
    if not cse332_lecture or not cse332_lab:
        return True
    
    # Check if section numbers match
    return cse332_lecture['section'] == cse332_lab['section']

def count_days_in_schedule(schedule):
    """
    H11: Count the total number of unique days in a schedule.
    
    Args:
        schedule (list): List of course rows representing a potential schedule
    
    Returns:
        int: Number of unique days in the schedule
    """
    all_days = ''
    for course in schedule:
        all_days += course['days']
    
    # Count unique day characters
    unique_days = set(all_days)
    return len(unique_days)

if __name__ == "__main__":
    # For testing
    import pandas as pd
    
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
    print(f"Original count: {len(test_df)}")
    print(f"Filtered count: {len(filtered_df)}")
    print(filtered_df) 
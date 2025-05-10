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

def apply_filters(courses_df, exclude_evening_classes=False, custom_constraints=None):
    """
    Apply all filtering criteria to the courses DataFrame.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        exclude_evening_classes (bool): Whether to exclude evening classes (starting at or after 6:00 PM)
        custom_constraints (dict, optional): Custom constraints provided by the user
            {
                'required_courses': list of course codes,
                'start_time_constraint': minimum start time for lectures,
                'day_pattern': allowed day patterns,
                'max_days': maximum number of distinct days,
                'instructor_preferences': dict mapping course codes to preferred instructors
            }
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses meeting all criteria
    """
    # Make a copy to avoid modifying the original
    filtered_df = courses_df.copy()
    
    # If custom constraints are provided, filter for required courses first
    if custom_constraints and 'required_courses' in custom_constraints:
        filtered_df = filter_required_courses(filtered_df, custom_constraints['required_courses'])
    
    # Apply custom start time constraint if provided
    start_time_constraint = '11:00 AM'  # Default
    if custom_constraints and 'start_time_constraint' in custom_constraints:
        start_time_constraint = custom_constraints['start_time_constraint']
    filtered_df = filter_by_start_time(filtered_df, start_time_constraint)
    
    # Apply custom day pattern constraint if provided
    day_pattern = ['ST', 'MW']  # Default
    if custom_constraints and 'day_pattern' in custom_constraints:
        day_pattern = custom_constraints['day_pattern']
    filtered_df = filter_by_day_pattern(filtered_df, day_pattern)
    
    # Apply instructor preferences if provided
    if custom_constraints and 'instructor_preferences' in custom_constraints:
        filtered_df = filter_by_instructor_preferences(filtered_df, custom_constraints['instructor_preferences'])
    else:
        # Apply default CSE327 instructor constraint if no custom preference is specified
        filtered_df = filter_cse327_sections(filtered_df)
    
    # Apply seat availability filter (always required)
    filtered_df = filter_available_seats(filtered_df)
    
    # Filter out labs starting at 08:00 (always required)
    filtered_df = filter_early_morning_labs(filtered_df)
    
    # Optional - filter out evening classes (starting at or after 6:00 PM)
    if exclude_evening_classes:
        filtered_df = filter_evening_classes(filtered_df)
    
    # H6: CSE 332 lecture and lab in same section is handled during schedule generation
    
    # H11: At most 5 distinct class days per week is handled during schedule generation
    
    return filtered_df

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

def filter_by_start_time(courses_df, min_start_time):
    """
    Filter courses to include only those starting at or after the specified minimum start time.
    Only applies to lecture courses - lab courses can be at any time.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        min_start_time (str): Minimum start time in format like "11:00 AM"
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Create a mask for lecture courses (those that need to meet start time constraint)
    lecture_courses = ~courses_df['course_code'].str.contains('L', case=True, na=False)
    after_min_time = courses_df['start_time'].apply(lambda x: is_after_start_time(x, min_start_time))
    
    # Courses must be either:
    # 1. Lab courses (no time restriction for now) OR
    # 2. Lecture courses that start at or after the minimum start time
    mask = (~lecture_courses) | (lecture_courses & after_min_time)
    
    return courses_df[mask]

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

def filter_by_day_pattern(courses_df, allowed_patterns):
    """
    Filter courses based on allowed day patterns.
    Lecture courses should match one of the allowed patterns.
    Lab courses can be on any day.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        allowed_patterns (list): List of allowed day patterns (e.g., ['ST', 'MW'])
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Apply the day filter based on course type and allowed patterns
    return courses_df[courses_df.apply(
        lambda row: is_valid_day_pattern(row['days'], row['course_code'], allowed_patterns), 
        axis=1
    )]

def is_st_mw_only(day_str, course_code):
    """
    Check if section days are appropriate based on course type.
    H4: Lecture courses must be on ST (Sunday-Tuesday) or MW (Monday-Wednesday) only.
    H5: Lab courses can be on any day of the week.
    
    Args:
        day_str (str): String containing day codes
        course_code (str): Course code to determine if it's a lab course
    
    Returns:
        bool: True if days are appropriate for the course type, False otherwise
    """
    return is_valid_day_pattern(day_str, course_code, ['ST', 'MW'])

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

def filter_by_instructor_preferences(courses_df, instructor_preferences):
    """
    Filter courses based on instructor preferences.
    Only applies the filter to courses specified in the preferences.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
        instructor_preferences (dict): Dictionary mapping course codes to preferred instructors
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    filtered_df = courses_df.copy()
    
    for course_code, preferred_instructor in instructor_preferences.items():
        # Create a mask for rows not matching this course code
        non_course_mask = ~filtered_df['course_code'].str.contains(course_code, case=False, na=False)
        
        # Create a mask for rows matching this course code and instructor
        course_instructor_mask = (
            filtered_df['course_code'].str.contains(course_code, case=False, na=False) &
            filtered_df['instructor'].str.contains(preferred_instructor, case=False, na=False)
        )
        
        # Apply the combined mask
        filtered_df = filtered_df[non_course_mask | course_instructor_mask]
    
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
        # For each required course, look for exact matches and labs if needed
        course_mask = course_mask | courses_df['course_code'].str.contains(course, case=False, na=False)
        
        # If the course has a lab component (CSE332 -> CSE332L), also include it
        if course.upper().startswith('CSE332'):
            course_mask = course_mask | courses_df['course_code'].str.contains('CSE332L', case=False, na=False)
    
    return courses_df[course_mask]

def filter_cse327_sections(courses_df):
    """
    H7: Filter CSE 327 to include only sections 1 or 7 with instructor "NBM".
    Leave other courses unchanged.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Create a mask that is True for non-CSE 327 courses
    non_cse327_mask = ~courses_df['course_code'].str.contains('CSE327', case=False, na=False)
    
    # Create a mask for CSE 327 courses with section 1 or 7 and instructor NBM
    cse327_mask = (
        courses_df['course_code'].str.contains('CSE327', case=False, na=False) &
        courses_df['section'].isin(['1', '7']) &
        courses_df['instructor'].str.contains('NBM', case=False, na=False)
    )
    
    # Combine masks to keep non-CSE 327 courses and filtered CSE 327 courses
    return courses_df[non_cse327_mask | cse327_mask]

def filter_available_seats(courses_df):
    """
    H9: Filter out sections with 0 seats available.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with sections having seats > 0
    """
    # Convert 'seats' column to numeric and filter rows with seats > 0
    courses_df['seats'] = pd.to_numeric(courses_df['seats'], errors='coerce')
    return courses_df[courses_df['seats'] > 0]

def filter_early_morning_labs(courses_df):
    """
    H10: Filter out labs that start exactly at 08:00.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame without 08:00 labs
    """
    # Create a mask for lab courses
    lab_courses = courses_df['course_code'].str.contains('L', case=True, na=False)
    
    # Create a mask for courses that start at 08:00
    early_morning = courses_df['start_time'].str.startswith('08:00', na=False)
    
    # Remove lab courses that start at 08:00
    mask = ~(lab_courses & early_morning)
    
    return courses_df[mask]

def filter_evening_classes(courses_df):
    """
    H12: Filter out evening classes that start at or after 6:00 PM.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame without evening classes
    """
    # Create a mask for courses that start before 6:00 PM
    mask = courses_df['start_time'].apply(is_before_6pm)
    
    return courses_df[mask]

def is_before_6pm(time_str):
    """
    Check if a start time is before 6:00 PM.
    
    Args:
        time_str (str): Time string in format like "5:00 PM"
    
    Returns:
        bool: True if time is before 6:00 PM, False otherwise
    """
    if not time_str or pd.isna(time_str):
        return False
    
    try:
        # Parse the time string into components
        match = re.match(r'(\d+):(\d+)\s*(AM|PM)', time_str)
        if not match:
            return False
            
        hour, minute, ampm = match.groups()
        hour = int(hour)
        
        # Any AM time is before 6 PM
        if ampm == "AM":
            return True
        # PM time before 6:00 PM
        elif ampm == "PM" and hour < 6:
            return True
        # 12:00 PM is noon, before 6 PM
        elif ampm == "PM" and hour == 12:
            return True
            
        return False
    except:
        return False

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
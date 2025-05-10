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
"""

import pandas as pd
from datetime import datetime
import re

def apply_filters(courses_df):
    """
    Apply all filtering criteria to the courses DataFrame.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with courses meeting all criteria
    """
    # Make a copy to avoid modifying the original
    filtered_df = courses_df.copy()
    
    # H3: Filter for lectures starting at or after 11:00 AM (not 12 PM anymore)
    filtered_df = filter_after_11am(filtered_df)
    
    # H4: Filter for lecture courses on ST/MW only
    filtered_df = filter_st_mw_only(filtered_df)
    
    # H7: Filter for CSE327 sections with instructor NBM
    filtered_df = filter_cse327_sections(filtered_df)
    
    # H9: Filter for sections with available seats
    filtered_df = filter_available_seats(filtered_df)
    
    # H10: Filter out labs starting at 08:00
    filtered_df = filter_early_morning_labs(filtered_df)
    
    # H6: CSE 332 lecture and lab in same section is handled during schedule generation
    
    # H11: At most 5 distinct class days per week is handled during schedule generation
    
    return filtered_df

def is_after_11am(time_str):
    """
    Check if a start time is at or after 11:00 AM.
    
    Args:
        time_str (str): Time string in format like "11:00 AM"
    
    Returns:
        bool: True if time is at or after 11:00 AM, False otherwise
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
        
        # 11:00 AM or later in the morning
        if ampm == "AM" and hour >= 11:
            return True
        # 12:00 AM is midnight, so this should return False
        elif ampm == "AM" and hour == 12:
            return False
        # Any PM time (afternoon/evening)
        elif ampm == "PM" and hour != 12:
            return True
        # 12:00 PM is noon
        elif ampm == "PM" and hour == 12:
            return True
            
        return False
    except:
        return False

def filter_after_11am(courses_df):
    """
    Filter courses to include only those starting at or after 11:00 AM.
    Only applies to lecture courses - lab courses can be at any time.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Create a mask for lecture courses (those that need to be after 11 AM)
    lecture_courses = ~courses_df['course_code'].str.contains('L', case=True, na=False)
    after_11am = courses_df['start_time'].apply(is_after_11am)
    
    # Courses must be either:
    # 1. Lab courses (no time restriction for now) OR
    # 2. Lecture courses that start at or after 11:00 AM
    mask = (~lecture_courses) | (lecture_courses & after_11am)
    
    return courses_df[mask]

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
    if not day_str or pd.isna(day_str):
        return False
    
    # Check if this is a lab course
    is_lab = 'L' in course_code
    
    # H5: Lab courses have no day restrictions
    if is_lab:
        return True
    else:
        # H4: Lecture courses must be on ST or MW only
        valid_day_combinations = ['ST', 'MW', 'S', 'M', 'T', 'W']
        
        # Sort the day string to normalize it (e.g., "TS" becomes "ST")
        sorted_days = ''.join(sorted(day_str))
        
        # For lectures, the exact day combination must be in the valid list
        return sorted_days in valid_day_combinations

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
    # Apply the day filter based on course type
    return courses_df[courses_df.apply(lambda row: is_st_mw_only(row['days'], row['course_code']), axis=1)]

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
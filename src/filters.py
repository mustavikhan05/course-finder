#!/usr/bin/env python3
"""
NSU Course Scheduler - Filter Implementation Module

This module provides functions for filtering course sections based on specified criteria:
- Classes starting after 12 PM
- Schedule spanning only 4 days per week
- Classes occurring only on ST (Sunday-Tuesday) and MW (Monday-Wednesday) slots
- CSE 332 lecture and lab being in the same section
- CSE 327 being section 1 or 7 with instructor "NBM"
"""

import pandas as pd
from datetime import datetime

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
    
    # Apply individual filters
    filtered_df = filter_after_12pm(filtered_df)
    filtered_df = filter_st_mw_only(filtered_df)
    filtered_df = filter_cse327_sections(filtered_df)
    
    # Filter for CSE 332 lecture and lab in same section requires special handling
    # We'll keep all courses initially but check this constraint during schedule generation
    
    return filtered_df

def is_after_12pm(time_str):
    """
    Check if a start time is after 12 PM.
    
    Args:
        time_str (str): Time string in format like "1:00 PM"
    
    Returns:
        bool: True if time is after 12 PM, False otherwise
    """
    if not time_str or pd.isna(time_str):
        return False
    
    try:
        # Handle "12:00 PM" case specially
        if "12:00 PM" in time_str:
            return True
        
        # Check for PM indicator
        return "PM" in time_str and not time_str.startswith("12:00")
    except:
        return False

def filter_after_12pm(courses_df):
    """
    Filter courses to include only those starting after 12 PM.
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    return courses_df[courses_df['start_time'].apply(is_after_12pm)]

def is_st_mw_only(day_str, course_code):
    """
    Check if section days are appropriate based on course type.
    Lecture courses should be on ST (Sunday-Tuesday) or MW (Monday-Wednesday) only.
    Lab courses can also be on R (Thursday) but not on A (Saturday).
    
    Args:
        day_str (str): String containing day codes
        course_code (str): Course code to determine if it's a lab course
    
    Returns:
        bool: True if days are appropriate for the course type, False otherwise
    """
    if not day_str or pd.isna(day_str):
        return False
    
    # Check if this is a lab course
    is_lab = any(lab_code in course_code for lab_code in ['CSE332L', 'PHY108L', 'CHE101L'])
    
    # Define valid day combinations based on course type
    if is_lab:
        # Lab courses can be on ST, MW, or R
        valid_day_combinations = ['ST', 'MW', 'S', 'M', 'T', 'W', 'R']
        
        # Make sure no A (Saturday) in the day string
        if 'A' in day_str:
            return False
    else:
        # Lecture courses must be on ST or MW only
        valid_day_combinations = ['ST', 'MW', 'S', 'M', 'T', 'W']
    
    # Sort the day string to normalize it (e.g., "TS" becomes "ST")
    sorted_days = ''.join(sorted(day_str))
    
    # For labs, we need to check if the day string contains only valid days
    if is_lab:
        return all(day in valid_day_combinations for day in day_str)
    else:
        # For lectures, the exact day combination must be in the valid list
        return sorted_days in valid_day_combinations

def filter_st_mw_only(courses_df):
    """
    Filter courses based on day patterns.
    Lecture courses should be on ST/MW only.
    Lab courses can also be on R (Thursday) but not on A (Saturday).
    
    Args:
        courses_df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Apply the day filter based on course type
    return courses_df[courses_df.apply(lambda row: is_st_mw_only(row['days'], row['course_code']), axis=1)]

def filter_cse327_sections(courses_df):
    """
    Filter CSE 327 to include only sections 1 or 7 with instructor "NBM".
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

def has_same_section_cse332(schedule):
    """
    Check if CSE 332 lecture and lab are in the same section.
    This function works on a schedule (subset of courses) rather than the full DataFrame.
    
    Args:
        schedule (list): List of course rows representing a potential schedule
    
    Returns:
        bool: True if CSE 332 courses have matching sections, False otherwise
    """
    cse332_courses = [course for course in schedule if 'CSE332' in course['course_code']]
    
    # If there are no CSE 332 courses or only one, return True
    if len(cse332_courses) <= 1:
        return True
    
    # Check if all sections match
    sections = set(course['section'] for course in cse332_courses)
    return len(sections) == 1

def count_days_in_schedule(schedule):
    """
    Count the total number of unique days in a schedule.
    
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
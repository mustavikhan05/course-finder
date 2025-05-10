#!/usr/bin/env python3
"""
NSU Course Scheduler - Schedule Generator Module

This module is responsible for generating valid schedule combinations from
filtered course sections, ensuring they meet all 11 hard constraints and
optimizing for the soft preferences:

Soft Preferences:
P1: 4 distinct class-days (perfect) vs 5 - +100 if 4 days, +50 if 5 days
P2: Later lab starts - subtract (11 - start_hour) for each lab that starts before 11 AM
P3: Compact days - subtract total idle minutes across the week

Hard constraints are implemented as filters during schedule generation.
"""

import pandas as pd
import re
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
    partial_schedules = []  # For storing partial schedules
    
    # Get all course codes
    course_codes = list(course_options.keys())
    
    # Separate course codes into required lectures, required labs, and CSE332L lab
    required_lectures = [code for code in course_codes if any(course in code for course in ["BIO103", "CSE327", "CSE332", "EEE452", "ENG115"]) and "L" not in code]
    required_labs = [code for code in course_codes if any(course in code for course in ["CHE101L", "PHY108L"])]
    cse332l_code = next((code for code in course_codes if "CSE332L" in code), None)
    
    # Add counters for debugging
    global debug_stats
    debug_stats = {
        'total_attempted': 0,
        'conflict_failures': 0,
        'days_constraint_failures': 0,
        'cse332_pair_failures': 0,
        'valid_schedules': 0,
        'valid_partial_schedules': 0
    }
    
    # Show how many sections are available for each course
    for code in course_codes:
        print(f"Course {code} has {len(course_options[code])} sections")
    
    # Use recursive approach to build schedules
    print("Starting schedule generation...")
    generate_schedule_recursive(course_codes, 0, {}, course_options, valid_schedules, partial_schedules)
    
    # Print debug stats
    print("\nSchedule generation stats:")
    for key, value in debug_stats.items():
        print(f"  {key}: {value}")
    
    # Sort schedules by score (higher is better)
    if valid_schedules:
        valid_schedules.sort(key=lambda x: -score_schedule(x))
        print(f"\nFound {len(valid_schedules)} valid complete schedules.")
        return valid_schedules
    
    # Sort and return partial schedules if no full schedules are found
    if partial_schedules:
        # Sort partial schedules by the number of courses (more is better) and score
        partial_schedules.sort(key=lambda x: (-len(x), -score_schedule(x)))
        print(f"\nFound {len(partial_schedules)} partial schedules (4+ courses).")
        print("Top 3 partial schedules:")
        for i, schedule in enumerate(partial_schedules[:3]):
            print(f"\nPARTIAL SCHEDULE #{i+1} ({len(schedule)} courses)")
            print(format_schedule(schedule))
            print("-" * 60)
        return partial_schedules
    
    return valid_schedules

def process_cse332_sections(course_options):
    """
    Process CSE 332 sections to ensure lecture and lab are properly handled.
    This function modifies the course_options dictionary in place.
    
    Args:
        course_options (dict): Dictionary mapping course codes to lists of section options
    """
    # Find CSE 332 courses
    cse332_courses = [code for code in course_options.keys() if 'CSE332' in code]
    
    print(f"Found {len(cse332_courses)} CSE332 course types: {cse332_courses}")
    
    if len(cse332_courses) <= 1:
        # Nothing to process
        print("Not enough CSE332 course types to process pairing (need both lecture and lab)")
        return
    
    # Enhanced debugging - show all available sections for each course type
    lecture_sections = {}
    lab_sections = {}
    
    for course in cse332_courses:
        print(f"Course {course} has {len(course_options[course])} section options")
        sections = []
        
        # Group for easier comparison
        if "CSE332L" in course:
            for section in course_options[course]:
                section_number = section['section']
                lab_sections[section_number] = section
                sections.append(section_number)
        else:
            for section in course_options[course]:
                section_number = section['section']
                lecture_sections[section_number] = section
                sections.append(section_number)
        
        print(f"  Sections: {sections}")
    
    print(f"Lecture sections: {list(lecture_sections.keys())}")
    print(f"Lab sections: {list(lab_sections.keys())}")
    
    # Find matching sections (intersection)
    matching_sections = set(lecture_sections.keys()) & set(lab_sections.keys())
    print(f"Matching sections between lecture and lab: {matching_sections}")
    
    # H6: CSE 332 lecture and lab must have identical section numbers
    # If there are no matching sections, one or both course types will end up empty
    if not matching_sections:
        print("WARNING: No matching section numbers between CSE332 lecture and lab!")
        print("This constraint cannot be satisfied. Schedule generation will likely fail.")
    else:
        print(f"Found {len(matching_sections)} valid section pairs for CSE332 lecture and lab.")
        
        # Keep only matching sections for both lecture and lab
        for course in cse332_courses:
            if "CSE332L" in course:
                course_options[course] = [section for section in course_options[course] 
                                          if section['section'] in matching_sections]
            else:
                course_options[course] = [section for section in course_options[course]
                                          if section['section'] in matching_sections]
                
        print(f"After matching, course options updated:")
        for course in cse332_courses:
            print(f"  {course} now has {len(course_options[course])} sections")

def generate_schedule_recursive(course_codes, index, current_schedule, course_options, valid_schedules, partial_schedules):
    """
    Recursively generate valid schedules by trying different course sections.
    
    Args:
        course_codes (list): List of course codes to schedule
        index (int): Current index in course_codes list
        current_schedule (dict): Current partial schedule being built
        course_options (dict): Dictionary mapping course codes to lists of section options
        valid_schedules (list): List to collect valid complete schedules
        partial_schedules (list): List to collect valid partial schedules (4+ courses)
    """
    # For debug tracking
    global debug_stats
    
    # Check if we have a valid partial schedule (4+ courses)
    if len(current_schedule) >= 4:
        # Convert current partial schedule to a list
        schedule = list(current_schedule.values())
        
        # Check constraints for this partial schedule
        days_count = count_days_in_schedule(schedule)
        has_valid_cse332 = has_same_section_cse332(schedule)
        
        if days_count <= 5 and has_valid_cse332:
            # We have a valid partial schedule
            # Add a copy to avoid reference issues when backtracking
            if schedule not in partial_schedules:  # Avoid duplicates
                partial_schedules.append(schedule.copy())
                debug_stats['valid_partial_schedules'] += 1
    
    # Base case: we've assigned all courses
    if index == len(course_codes):
        # Convert to list of courses
        schedule = list(current_schedule.values())
        debug_stats['total_attempted'] += 1
        
        # H11: Check total days constraint (max 5 days)
        days_count = count_days_in_schedule(schedule)
        if days_count <= 5:
            # H6: Check if CSE 332 lecture and lab have same section
            if has_same_section_cse332(schedule):
                valid_schedules.append(schedule)
                debug_stats['valid_schedules'] += 1
                # If this is the first valid schedule, print it
                if len(valid_schedules) == 1:
                    print("\nFirst valid schedule found:")
                    print(format_schedule(schedule))
            else:
                debug_stats['cse332_pair_failures'] += 1
        else:
            debug_stats['days_constraint_failures'] += 1
            # Print details of the first few failures
            if debug_stats['days_constraint_failures'] <= 3:
                print(f"Failed on days constraint: {days_count} days in schedule (> 5)")
                all_days = set()
                for course in schedule:
                    for day in course['days']:
                        all_days.add(day)
                print(f"Days in schedule: {sorted(all_days)}")
        return
    
    # Get current course code and its options
    current_code = course_codes[index]
    options = course_options[current_code]
    
    # Try each option for the current course
    for option in options:
        # Check if this option conflicts with any course already in the schedule
        conflict_found = False
        for existing_course in current_schedule.values():
            if has_time_conflict(option, existing_course):
                conflict_found = True
                debug_stats['conflict_failures'] += 1
                break
        
        if not conflict_found:
            # Add this option to the schedule
            current_schedule[current_code] = option
            
            # Recurse to the next course
            generate_schedule_recursive(
                course_codes, index + 1, current_schedule, 
                course_options, valid_schedules, partial_schedules
            )
            
            # Backtrack
            del current_schedule[current_code]

def has_time_conflict(course1, course2):
    """
    H8: Check if two courses have overlapping days and times.
    
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
    Score a schedule based on preferences (higher is better):
    P1: 4 distinct class-days (perfect) vs 5 (+100 if 4 days, +50 if 5 days)
    P2: Later lab starts (-penalty for each lab before 11 AM)
    P3: Compact days (-penalty for idle time between classes)
    
    Args:
        schedule (list): List of courses in a schedule
    
    Returns:
        float: Score value (higher is better)
    """
    score = 0
    
    # P1: Prefer fewer days
    num_days = count_days_in_schedule(schedule)
    if num_days == 4:
        score += 100  # Perfect: 4 days
    elif num_days == 5:
        score += 50   # Good: 5 days
    
    # P2: Prefer later lab starts
    for course in schedule:
        if 'L' in course['course_code']:  # It's a lab
            start_hour = extract_hour(course['start_time'])
            if start_hour < 11:
                # Subtract penalty for early labs
                score -= (11 - start_hour)
    
    # P3: Prefer compact days (less idle time)
    idle_minutes = calculate_idle_minutes(schedule)
    score -= idle_minutes
    
    return score

def extract_hour(time_str):
    """
    Extract hour from time string, converting to 24-hour format.
    
    Args:
        time_str (str): Time string like "1:00 PM"
    
    Returns:
        int: Hour in 24-hour format
    """
    if not time_str or pd.isna(time_str):
        return 0
    
    try:
        match = re.match(r'(\d+):(\d+)\s*(AM|PM)', time_str)
        if not match:
            return 0
            
        hour, minute, ampm = match.groups()
        hour = int(hour)
        
        # Convert to 24-hour
        if ampm == "PM" and hour < 12:
            hour += 12
        elif ampm == "AM" and hour == 12:
            hour = 0
            
        return hour
    except:
        return 0

def calculate_idle_minutes(schedule):
    """
    Calculate total idle minutes between classes in a week.
    
    Args:
        schedule (list): List of courses in a schedule
    
    Returns:
        int: Total idle minutes
    """
    total_idle_minutes = 0
    
    # Group classes by day
    day_schedules = {}
    for course in schedule:
        for day in course['days']:
            if day not in day_schedules:
                day_schedules[day] = []
            
            # Add this class to the day's schedule
            day_schedules[day].append({
                'start': parse_time(course['start_time']),
                'end': parse_time(course['end_time'])
            })
    
    # For each day, sort classes by start time and calculate idle time
    for day, classes in day_schedules.items():
        if len(classes) <= 1:
            continue
            
        # Sort by start time
        sorted_classes = sorted(classes, key=lambda x: x['start'])
        
        # Calculate idle time between consecutive classes
        for i in range(1, len(sorted_classes)):
            gap_minutes = (sorted_classes[i]['start'] - sorted_classes[i-1]['end']) * 60
            if gap_minutes > 0:
                total_idle_minutes += gap_minutes
    
    return total_idle_minutes

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
    
    # Add schedule score
    score = score_schedule(schedule)
    result.append(f"Schedule score: {score}")
    
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
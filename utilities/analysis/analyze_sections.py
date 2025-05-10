#!/usr/bin/env python3
"""
NSU Course Scheduler - Section Analysis Tool

This script displays detailed information about all available sections for the target courses
after filtering, to help with manual analysis of scheduling possibilities.
"""

import pandas as pd
import sys
import os

# Add the src directory to the path so we can import from other modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'src')))

from scraper import fetch_course_data
from filters import filter_after_11am, filter_cse327_sections, is_after_11am
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'config')))
from config.settings import TARGET_COURSES

def filter_lecture_courses_st_mw_only(df):
    """
    Filter lecture courses to include only those on ST or MW days.
    Lab courses are not restricted by this filter.
    
    Args:
        df (pandas.DataFrame): DataFrame containing course information
    
    Returns:
        pandas.DataFrame: Filtered DataFrame
    """
    # Apply only to lecture courses (those without 'L' in the course code)
    lecture_courses = ~df['course_code'].str.contains('L', case=True, na=False)
    valid_days = df['days'].isin(['ST', 'MW', 'S', 'M', 'T', 'W'])
    
    # Create the combined mask
    mask = ~lecture_courses | (lecture_courses & valid_days)
    
    return df[mask]

def analyze_sections():
    """
    Fetch course data, apply filters, and display detailed information about each section.
    """
    print("Fetching course data...")
    courses_df = fetch_course_data()
    
    # Show counts for each target course before any filtering
    print("\n==== BEFORE ANY FILTERING ====")
    for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
        sections = courses_df[courses_df['course_code'].str.contains(course, case=False, na=False)]
        print(f"{course}: {len(sections)} sections")
    
    # Apply time filter (after 11 AM for lectures only)
    time_filtered_df = filter_after_11am(courses_df)
    
    # Show counts after time filter
    print("\n==== AFTER 11 AM FILTER (LECTURES ONLY) ====")
    for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
        sections = time_filtered_df[time_filtered_df['course_code'].str.contains(course, case=False, na=False)]
        print(f"{course}: {len(sections)} sections")
    
    # Apply lecture course day filter (ST/MW only for non-lab courses)
    day_filtered_df = filter_lecture_courses_st_mw_only(time_filtered_df)
    
    # Show counts after day filter
    print("\n==== AFTER ST/MW FILTER FOR LECTURE COURSES ONLY ====")
    for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
        sections = day_filtered_df[day_filtered_df['course_code'].str.contains(course, case=False, na=False)]
        print(f"{course}: {len(sections)} sections")
    
    # Apply CSE327 filter
    filtered_df = filter_cse327_sections(day_filtered_df)
    
    # Show counts after CSE327 filter
    print("\n==== AFTER CSE327 FILTER (FINAL) ====")
    for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
        sections = filtered_df[filtered_df['course_code'].str.contains(course, case=False, na=False)]
        print(f"{course}: {len(sections)} sections")
    
    # Map course codes to more readable names
    course_names = {
        'BIO103': 'BIO103 (Biology)',
        'CHE101L': 'CHE101L (Chemistry Lab)',
        'CSE327': 'CSE327 (Software Engineering)',
        'CSE332/EEE336': 'CSE332 (Computer Architecture)',
        'CSE332L/EEE336L': 'CSE332L (Computer Architecture Lab)',
        'EEE452': 'EEE452 (Digital Signal Processing)',
        'ENG115': 'ENG115 (English Writing)',
        'PHY108L': 'PHY108L (Physics Lab)'
    }
    
    # Display detailed information for each section
    print("\n" + "=" * 100)
    print("FINAL AVAILABLE SECTIONS AFTER ALL FILTERING")
    print("=" * 100)
    
    all_sections = {}
    
    for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
        sections = filtered_df[filtered_df['course_code'].str.contains(course, case=False, na=False)]
        all_sections[course] = sections
        
        # Display header for this course
        print(f"\n\n{course_names.get(course, course)} - {len(sections)} sections available:")
        print("-" * 100)
        
        if len(sections) == 0:
            print("NO SECTIONS AVAILABLE")
            continue
            
        # Format and display each section
        for _, section in sections.iterrows():
            section_info = (
                f"Section {section['section']} | "
                f"Days: {section['days']} | "
                f"Time: {section['start_time']} - {section['end_time']} | "
                f"Instructor: {section['instructor']} | "
                f"Room: {section['room']} | "
                f"Seats: {section['seats']}"
            )
            print(section_info)
    
    # Analyze CSE332 lecture/lab section matching
    print("\n\n" + "=" * 100)
    print("CSE332/CSE332L SECTION MATCHING ANALYSIS")
    print("=" * 100)
    
    if 'CSE332/EEE336' in all_sections and 'CSE332L/EEE336L' in all_sections:
        lecture_sections = all_sections['CSE332/EEE336']
        lab_sections = all_sections['CSE332L/EEE336L']
        
        print(f"\nCSE332 lecture sections: {lecture_sections['section'].tolist()}")
        print(f"CSE332L lab sections: {lab_sections['section'].tolist()}")
        
        matching_sections = set(lecture_sections['section']) & set(lab_sections['section'])
        print(f"\nMatching section numbers: {matching_sections}")
        
        if len(matching_sections) == 0:
            print("\nWARNING: No matching section numbers found between CSE332 lecture and lab.")
            print("This is a critical issue since matching section numbers are required.")
        else:
            print(f"\nFound {len(matching_sections)} matching section pairs for CSE332 lecture and lab.")
            
            # Display details of matching sections
            print("\nMatching section details:")
            for section_num in matching_sections:
                lecture = lecture_sections[lecture_sections['section'] == section_num].iloc[0]
                lab = lab_sections[lab_sections['section'] == section_num].iloc[0]
                
                is_lecture_after_11am = is_after_11am(lecture['start_time'])
                lecture_time_note = "after 11 AM" if is_lecture_after_11am else "before 11 AM"
                
                print(f"\nSection {section_num}:")
                print(f"  Lecture: Days {lecture['days']}, Time {lecture['start_time']} - {lecture['end_time']} ({lecture_time_note})")
                print(f"  Lab: Days {lab['days']}, Time {lab['start_time']} - {lab['end_time']}")
    
    # Print time conflicts matrix
    print("\n\n" + "=" * 100)
    print("TIME CONFLICTS ANALYSIS")
    print("=" * 100)
    
    # Select one representative section for each course (for simplicity)
    representatives = {}
    for course, sections in all_sections.items():
        if len(sections) > 0:
            representatives[course] = sections.iloc[0]
    
    # Check conflicts between all pairs
    print("\nConflict matrix (X indicates a conflict):")
    print("-" * 60)
    
    # Print header row
    header = "          |"
    for course in representatives:
        header += f" {course[:7]:7} |"
    print(header)
    print("-" * len(header))
    
    # Print conflict matrix
    for course1, section1 in representatives.items():
        row = f"{course1[:10]:10} |"
        for course2 in representatives:
            section2 = representatives[course2]
            if course1 == course2:
                row += "   -    |"
            else:
                # Check for day overlap
                days1 = section1['days']
                days2 = section2['days']
                day_overlap = any(day in days2 for day in days1)
                
                if not day_overlap:
                    row += "       |"
                else:
                    # Check for time overlap
                    start1 = section1['start_time']
                    end1 = section1['end_time']
                    start2 = section2['start_time']
                    end2 = section2['end_time']
                    
                    # Simplified time comparison (just string comparison)
                    time_conflict = not (end1 <= start2 or end2 <= start1)
                    
                    if time_conflict:
                        row += "   X    |"
                    else:
                        row += "       |"
        print(row)
    
    print("\n\nThis analysis shows all available sections for your target courses after filtering.")
    print("You can use this information to manually check if a complete schedule is possible.")
    print("If there are enough sections without time conflicts, a complete schedule should be possible.")

if __name__ == "__main__":
    analyze_sections() 
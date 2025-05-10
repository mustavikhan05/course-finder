#!/usr/bin/env python3
"""
Simple script to show all CSE332L sections without any filtering.
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scraper import fetch_course_data

def main():
    # Fetch all course data
    print("Fetching course data...")
    courses_df = fetch_course_data()
    
    # Get all CSE332 sections
    print("\n==== ALL CSE332 LECTURE SECTIONS ====")
    lecture_sections = courses_df[courses_df['course_code'].str.contains('CSE332/EEE336', case=False, na=False)]
    print(f"Found {len(lecture_sections)} total lecture sections")
    
    for _, section in lecture_sections.iterrows():
        print(f"Section {section['section']} | Days: {section['days']} | "
              f"Time: {section['start_time']} - {section['end_time']} | "
              f"Instructor: {section['instructor']}")
    
    # Get all CSE332L sections
    print("\n==== ALL CSE332L LAB SECTIONS ====")
    lab_sections = courses_df[courses_df['course_code'].str.contains('CSE332L/EEE336L', case=False, na=False)]
    print(f"Found {len(lab_sections)} total lab sections")
    
    for _, section in lab_sections.iterrows():
        print(f"Section {section['section']} | Days: {section['days']} | "
              f"Time: {section['start_time']} - {section['end_time']} | "
              f"Instructor: {section['instructor']}")
    
    # Check for matching section numbers
    lecture_section_numbers = set(lecture_sections['section'])
    lab_section_numbers = set(lab_sections['section'])
    
    print("\n==== SECTION NUMBER ANALYSIS ====")
    print(f"Lecture section numbers: {lecture_section_numbers}")
    print(f"Lab section numbers: {lab_section_numbers}")
    
    matching_sections = lecture_section_numbers.intersection(lab_section_numbers)
    print(f"Matching section numbers: {matching_sections}")
    
    if len(matching_sections) == 0:
        print("\nWARNING: No matching section numbers between CSE332 lecture and lab!")
    else:
        print(f"\nFound {len(matching_sections)} sections with matching numbers.")
        
        # Display matching sections
        print("\nMatching sections details:")
        for section_num in matching_sections:
            lecture = lecture_sections[lecture_sections['section'] == section_num].iloc[0]
            lab = lab_sections[lab_sections['section'] == section_num].iloc[0]
            
            print(f"\nSection {section_num}:")
            print(f"  Lecture: Days {lecture['days']}, Time {lecture['start_time']} - {lecture['end_time']}")
            print(f"  Lab: Days {lab['days']}, Time {lab['start_time']} - {lab['end_time']}")

if __name__ == "__main__":
    main() 
#!/usr/bin/env python3
"""
Export raw course data to text files.
This script exports both unfiltered and filtered data for target courses.
"""

import pandas as pd
import sys
import os

# Add the parent directory to the path so we can import from other modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from scraper import fetch_course_data
from config.settings import TARGET_COURSES

def export_raw_data():
    """
    Fetch course data and export it to text files without any filtering.
    """
    print("Fetching course data...")
    courses_df = fetch_course_data()
    
    # Create data directory if it doesn't exist
    os.makedirs('data', exist_ok=True)
    
    # Export all raw data
    with open('data/all_raw_data.txt', 'w') as f:
        f.write("ALL AVAILABLE COURSE SECTIONS (RAW DATA)\n")
        f.write("=" * 80 + "\n\n")
        
        for index, row in courses_df.iterrows():
            f.write(f"Course: {row['course_code']} | Section: {row['section']} | Days: {row['days']} | ")
            f.write(f"Time: {row['start_time']} - {row['end_time']} | Instructor: {row['instructor']} | ")
            f.write(f"Room: {row['room']} | Seats: {row['seats']}\n")
    
    print(f"All raw data exported to data/all_raw_data.txt")
    
    # Filter for only target courses (without any other filtering)
    target_courses_data = courses_df[courses_df['course_code'].isin(TARGET_COURSES) | 
                                  courses_df['course_code'].str.contains('CSE332/EEE336', case=False, na=False) |
                                  courses_df['course_code'].str.contains('CSE332L/EEE336L', case=False, na=False)]
    
    # Export target courses data
    with open('data/target_courses_raw.txt', 'w') as f:
        f.write("TARGET COURSE SECTIONS (RAW DATA, NO FILTERS)\n")
        f.write("=" * 80 + "\n\n")
        
        # Group by course code for better organization
        grouped = target_courses_data.groupby('course_code')
        for course_code, group in grouped:
            f.write(f"\n{course_code} - {len(group)} sections:\n")
            f.write("-" * 80 + "\n")
            
            for index, row in group.iterrows():
                f.write(f"Section: {row['section']} | Days: {row['days']} | ")
                f.write(f"Time: {row['start_time']} - {row['end_time']} | Instructor: {row['instructor']} | ")
                f.write(f"Room: {row['room']} | Seats: {row['seats']}\n")
    
    print(f"Target courses raw data exported to data/target_courses_raw.txt")

if __name__ == "__main__":
    export_raw_data() 
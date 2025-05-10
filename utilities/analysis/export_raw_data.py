#!/usr/bin/env python3
"""
Export target course data to text files.
This script exports the target courses data from the NSU course offerings page.
"""

import pandas as pd
import sys
import os

# Add the src directory to the path so we can import from other modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'src')))

from scraper import fetch_course_data
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'config')))
from config.settings import TARGET_COURSES

def export_raw_data():
    """
    Fetch target course data and export it to text files.
    """
    print("Fetching target course data...")
    courses_df = fetch_course_data()  # This already returns only the target courses
    
    # Create data directory if it doesn't exist
    os.makedirs('../../data', exist_ok=True)
    
    # Export target courses raw data
    with open('../../data/target_courses_raw.txt', 'w') as f:
        f.write("TARGET COURSE SECTIONS (RAW DATA)\n")
        f.write("=" * 80 + "\n\n")
        
        for index, row in courses_df.iterrows():
            f.write(f"Course: {row['course_code']} | Section: {row['section']} | Days: {row['days']} | ")
            f.write(f"Time: {row['start_time']} - {row['end_time']} | Instructor: {row['instructor']} | ")
            f.write(f"Room: {row['room']} | Seats: {row['seats']}\n")
    
    print(f"Target courses raw data exported to data/target_courses_raw.txt")
    
    # Group by course code for better organization
    with open('../../data/target_courses_grouped.txt', 'w') as f:
        f.write("TARGET COURSE SECTIONS (GROUPED BY COURSE)\n")
        f.write("=" * 80 + "\n\n")
        
        # Group by course code for better organization
        grouped = courses_df.groupby('course_code')
        for course_code, group in grouped:
            f.write(f"\n{course_code} - {len(group)} sections:\n")
            f.write("-" * 80 + "\n")
            
            for index, row in group.iterrows():
                f.write(f"Section: {row['section']} | Days: {row['days']} | ")
                f.write(f"Time: {row['start_time']} - {row['end_time']} | Instructor: {row['instructor']} | ")
                f.write(f"Room: {row['room']} | Seats: {row['seats']}\n")
    
    print(f"Target courses grouped data exported to data/target_courses_grouped.txt")

if __name__ == "__main__":
    export_raw_data() 
#!/usr/bin/env python3
"""
NSU Course Scheduler - Main Application

This module serves as the entry point for the NSU Course Scheduler application.
It orchestrates the scraping, filtering, and scheduling processes and displays
the results in a simple dashboard that refreshes periodically.
"""

import time
import schedule
import colorama
from colorama import Fore, Style

from scraper import fetch_course_data
from filters import apply_filters, filter_after_12pm, filter_st_mw_only, filter_cse327_sections
from scheduler import generate_schedules, score_schedule, format_schedule

# Initialize colorama for cross-platform colored terminal output
colorama.init()

# Store previous valid schedules to detect changes
previous_schedules = []

def update_schedules():
    """
    Main function to fetch course data, apply filters, generate valid schedules,
    and display the results. Runs periodically.
    """
    try:
        # Fetch course data from NSU website
        courses_df = fetch_course_data()
        print(f"{Fore.CYAN}Total courses fetched: {len(courses_df)}{Style.RESET_ALL}")
        
        # See what's available for each target course
        for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
            filtered = courses_df[courses_df['course_code'].str.contains(course, case=False, na=False)]
            print(f"{course}: {len(filtered)} sections available")
        
        # Apply time filter and show results
        time_filtered_df = filter_after_12pm(courses_df)
        print(f"{Fore.CYAN}After 12PM filter: {len(time_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply day filter and show results
        day_filtered_df = filter_st_mw_only(time_filtered_df)
        print(f"{Fore.CYAN}After ST/MW only filter: {len(day_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply CSE327 filter and show results
        cse327_filtered_df = filter_cse327_sections(day_filtered_df)
        print(f"{Fore.CYAN}After CSE327 section/instructor filter: {len(cse327_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Check what's left for each target course
        for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
            filtered = cse327_filtered_df[cse327_filtered_df['course_code'].str.contains(course, case=False, na=False)]
            if len(filtered) > 0:
                print(f"{course}: {len(filtered)} sections remaining after filtering")
            else:
                print(f"{Fore.RED}{course}: 0 sections remaining (this is why no valid schedules can be found){Style.RESET_ALL}")
        
        # Apply all filters
        filtered_df = apply_filters(courses_df)
        
        # Generate valid schedule combinations
        valid_schedules = generate_schedules(filtered_df)
        
        # Display results
        display_schedules(valid_schedules)
        
        # Update previous schedules for change detection
        global previous_schedules
        previous_schedules = valid_schedules
        
    except Exception as e:
        print(f"{Fore.RED}Error: {str(e)}{Style.RESET_ALL}")

def display_schedules(schedules):
    """
    Display valid schedules in a formatted way with color highlighting.
    
    Args:
        schedules: List of valid schedule combinations
    """
    if not schedules:
        print(f"{Fore.YELLOW}No valid schedules found that meet all criteria.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}Found {len(schedules)} valid schedules:{Style.RESET_ALL}")
    
    # Sort schedules by score (lower is better)
    sorted_schedules = sorted(schedules, key=score_schedule)
    
    # Display the top 5 schedules (or fewer if less available)
    display_count = min(5, len(sorted_schedules))
    
    for i in range(display_count):
        schedule = sorted_schedules[i]
        is_new = False
        
        # Check if this is a new schedule compared to previous run
        if previous_schedules and i < len(previous_schedules):
            if set(tuple(sorted(course.items())) for course in schedule) != \
               set(tuple(sorted(course.items())) for course in previous_schedules[i]):
                is_new = True
        
        # Display header for this schedule
        if is_new:
            print(f"\n{Fore.YELLOW}SCHEDULE #{i+1} (NEW!){Style.RESET_ALL}")
        else:
            print(f"\n{Fore.CYAN}SCHEDULE #{i+1}{Style.RESET_ALL}")
        
        # Display formatted schedule
        print(format_schedule(schedule))
        
        # Display separator
        print("-" * 60)

def main():
    """
    Entry point for the application. Sets up the periodic schedule updating.
    """
    print(f"{Fore.CYAN}NSU Course Scheduler starting...{Style.RESET_ALL}")
    print("Monitoring for course sections that meet your criteria:")
    print("- Classes start after 12 PM")
    print("- Schedule spans only 5 days per week")
    print("- Classes occur only on ST (Sunday-Tuesday) and MW (Monday-Wednesday) slots")
    print("- CSE 332 lecture and lab must be in the same section")
    print("- CSE 327 must be section 1 or 7 with instructor \"NBM\"")
    
    # Run once immediately
    update_schedules()
    
    # Then schedule to run every 30 seconds
    schedule.every(30).seconds.do(update_schedules)
    
    try:
        while True:
            schedule.run_pending()
            time.sleep(1)
    except KeyboardInterrupt:
        print(f"{Fore.CYAN}NSU Course Scheduler stopped.{Style.RESET_ALL}")

if __name__ == "__main__":
    main() 
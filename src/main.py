#!/usr/bin/env python3
"""
NSU Course Scheduler - Main Application

This module serves as the entry point for the NSU Course Scheduler application.
It orchestrates the scraping, filtering, and scheduling processes and displays
the results in a simple dashboard that refreshes periodically.

The system applies 11 hard constraints:
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

Soft Preferences for ranking valid schedules:
P1: 4 distinct class-days (perfect) vs 5 - +100 if 4 days, +50 if 5 days
P2: Later lab starts - subtract (11 - start_hour) for each lab that starts before 11 AM
P3: Compact days - subtract total idle minutes across the week
"""

import time
import schedule
import colorama
from colorama import Fore, Style

from scraper import fetch_course_data
from filters import apply_filters, filter_after_11am, filter_st_mw_only, filter_cse327_sections
from filters import filter_available_seats, filter_early_morning_labs
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
        
        # Apply time filter and show results (H3)
        time_filtered_df = filter_after_11am(courses_df)
        print(f"{Fore.CYAN}After 11AM filter: {len(time_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply day filter and show results (H4, H5)
        day_filtered_df = filter_st_mw_only(time_filtered_df)
        print(f"{Fore.CYAN}After ST/MW only filter for lectures: {len(day_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply CSE327 filter and show results (H7)
        cse327_filtered_df = filter_cse327_sections(day_filtered_df)
        print(f"{Fore.CYAN}After CSE327 section/instructor filter: {len(cse327_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply seats filter (H9)
        seats_filtered_df = filter_available_seats(cse327_filtered_df)
        print(f"{Fore.CYAN}After available seats filter: {len(seats_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Apply early morning lab filter (H10)
        morning_filtered_df = filter_early_morning_labs(seats_filtered_df)
        print(f"{Fore.CYAN}After early morning lab filter: {len(morning_filtered_df)} courses remaining{Style.RESET_ALL}")
        
        # Check what's left for each target course
        for course in ['BIO103', 'CHE101L', 'CSE327', 'CSE332/EEE336', 'CSE332L/EEE336L', 'EEE452', 'ENG115', 'PHY108L']:
            filtered = morning_filtered_df[morning_filtered_df['course_code'].str.contains(course, case=False, na=False)]
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
    
    # Sort schedules by score (higher is better)
    sorted_schedules = sorted(schedules, key=lambda x: -score_schedule(x))
    
    # Display the top 10 schedules (or fewer if less available)
    display_count = min(10, len(sorted_schedules))
    
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
    print("Monitoring for course sections that meet these criteria:")
    print("Hard Constraints:")
    print("H1: Required lectures – choose exactly one lecture section for each of: BIO 103, CSE 327, CSE 332, EEE 452, ENG 115")
    print("H2: Required labs – choose exactly one lab section for each of: CHE 101 L and PHY 108 L")
    print("H3: Lecture start‐time ≥ 11:00 (inclusive) for every non-lab section")
    print("H4: Lecture day pattern – every non-lab section's days must be either {S,T} (ST) or {M,W} (MW)")
    print("H5: Lab day options – a lab's days may be any subset of {S,T,M,W,R,A}")
    print("H6: CSE 332 lecture–lab pairing – the CSE 332 lecture and lab must have identical section numbers")
    print("H7: CSE 327 instructor – must be taught by \"NbM\" (Section 1 or Section 7 in current data)")
    print("H8: No time collisions – if two chosen sections share at least one day and their time intervals overlap, reject the pair")
    print("H9: Seat availability – only select sections with seats > 0")
    print("H10: No 08:00 labs – exclude any lab whose start_time is exactly \"08:00\"")
    print("H11: At most 5 distinct class-days per week")
    
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
#!/usr/bin/env python3
"""
NSU Course Scheduler - Main Application

This module serves as the entry point for the NSU Course Scheduler application.
It orchestrates the scraping, filtering, and scheduling processes and displays
the results in a simple dashboard that refreshes periodically.

The system applies 12 hard constraints:
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
from filters import filter_available_seats, filter_early_morning_labs, filter_evening_classes
from scheduler import generate_schedules, score_schedule, format_schedule

# Initialize colorama for cross-platform colored terminal output
colorama.init()

# Store previous valid schedules to detect changes
previous_schedules = {
    "with_evening": [],
    "without_evening": []
}

def update_schedules():
    """
    Main function to fetch course data, apply filters, generate valid schedules,
    and display the results. Runs periodically.
    """
    try:
        # Fetch course data from NSU website
        courses_df = fetch_course_data()
        print(f"{Fore.CYAN}Total courses fetched: {len(courses_df)}{Style.RESET_ALL}")
        
        # Apply filters and generate schedules with evening classes included
        print(f"{Fore.GREEN}=== GENERATING SCHEDULES WITH EVENING CLASSES INCLUDED ==={Style.RESET_ALL}")
        filtered_df_with_evening = apply_filters(courses_df, exclude_evening_classes=False)
        valid_schedules_with_evening = generate_schedules(filtered_df_with_evening)
        
        # Apply filters and generate schedules without evening classes
        print(f"{Fore.GREEN}=== GENERATING SCHEDULES WITHOUT EVENING CLASSES ==={Style.RESET_ALL}")
        filtered_df_without_evening = apply_filters(courses_df, exclude_evening_classes=True)
        valid_schedules_without_evening = generate_schedules(filtered_df_without_evening)
        
        # Display results
        print(f"{Fore.CYAN}==== SCHEDULES INCLUDING EVENING CLASSES ===={Style.RESET_ALL}")
        display_schedules(valid_schedules_with_evening, "with_evening")
        
        print(f"{Fore.CYAN}==== SCHEDULES EXCLUDING EVENING CLASSES (START TIME < 6:00 PM) ===={Style.RESET_ALL}")
        display_schedules(valid_schedules_without_evening, "without_evening")
        
        # Update previous schedules for change detection
        global previous_schedules
        previous_schedules = {
            "with_evening": valid_schedules_with_evening,
            "without_evening": valid_schedules_without_evening
        }
        
    except Exception as e:
        print(f"{Fore.RED}Error: {str(e)}{Style.RESET_ALL}")

def display_schedules(schedules, schedule_type):
    """
    Display valid schedules in a formatted way with color highlighting.
    
    Args:
        schedules: List of valid schedule combinations
        schedule_type: Type of schedule ("with_evening" or "without_evening")
    """
    prev_schedules = previous_schedules.get(schedule_type, [])
    
    if not schedules:
        print(f"{Fore.YELLOW}No valid schedules found that meet all criteria.{Style.RESET_ALL}")
        return
    
    print(f"{Fore.GREEN}Found {len(schedules)} valid schedules{Style.RESET_ALL}")
    
    # Sort schedules by score (higher is better)
    sorted_schedules = sorted(schedules, key=lambda x: -score_schedule(x))
    
    # Display the top 10 schedules (or fewer if less available)
    display_count = min(10, len(sorted_schedules))
    
    for i in range(display_count):
        schedule = sorted_schedules[i]
        is_new = False
        
        # Check if this is a new schedule compared to previous run
        if prev_schedules and i < len(prev_schedules):
            if set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in schedule) != \
               set(tuple(sorted((k, str(v)) for k, v in course.items())) for course in prev_schedules[i]):
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
    print("H12: No evening classes – exclude any section with start time ≥ 6:00 PM (optional filter)")
    
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
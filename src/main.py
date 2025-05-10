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
from filters import apply_filters
from scheduler import generate_schedules

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
        
        # Apply filters based on preferences
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
    # Actual schedule display will be implemented later

def main():
    """
    Entry point for the application. Sets up the periodic schedule updating.
    """
    print(f"{Fore.CYAN}NSU Course Scheduler starting...{Style.RESET_ALL}")
    print("Monitoring for course sections that meet your criteria:")
    print("- Classes start after 12 PM")
    print("- Schedule spans only 4 days per week")
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
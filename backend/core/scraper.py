#!/usr/bin/env python3
"""
NSU Course Scheduler - Web Scraping Module

This module handles fetching and parsing course data from the NSU course offerings page.
It extracts relevant course information into a pandas DataFrame for further processing.
"""

import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import random
import sys
import os

# Add the parent directory to the path so we can import from config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.settings import (
    NSU_COURSE_URL, TARGET_COURSES, 
    USER_AGENT, REQUEST_TIMEOUT,
    REQUEST_DELAY_MIN, REQUEST_DELAY_MAX
)

def fetch_course_data():
    """
    Fetch course data from the NSU website and parse it into a DataFrame.
    
    Returns:
        pandas.DataFrame: DataFrame containing course information
    """
    html_content = fetch_page()
    courses_df = parse_html_to_dataframe(html_content)
    
    # Print number of courses before filtering
    print(f"Total courses fetched before filtering: {len(courses_df)}")
    print("\nAvailable course codes in raw data:")
    print(courses_df['course_code'].unique())
    
    courses_df = filter_target_courses(courses_df)
    return courses_df

def fetch_page():
    """
    Fetch the course offerings page with proper headers and error handling.
    
    Returns:
        str: HTML content of the page
    
    Raises:
        Exception: If there's an error fetching the page
    """
    headers = {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
    }
    
    try:
        # Add a small random delay to avoid overloading the server
        time.sleep(random.uniform(REQUEST_DELAY_MIN, REQUEST_DELAY_MAX))
        
        response = requests.get(NSU_COURSE_URL, headers=headers, timeout=REQUEST_TIMEOUT)
        
        if response.status_code != 200:
            raise Exception(f"Failed to fetch page: HTTP {response.status_code}")
        
        return response.text
    
    except requests.RequestException as e:
        raise Exception(f"Error fetching page: {str(e)}")

def parse_html_to_dataframe(html_content):
    """
    Parse HTML content and extract course information into a DataFrame.
    
    Args:
        html_content (str): HTML content of the course offerings page
    
    Returns:
        pandas.DataFrame: DataFrame with columns for course information
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Find the main course table
    table = soup.find('table', {'id': 'offeredCourseTbl'})
    
    if not table:
        raise Exception("Could not find course offerings table in the HTML")
    
    courses = []
    # Get all rows from tbody (skipping header)
    rows = table.find('tbody').find_all('tr')
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) < 6:
            continue
        
        # Based on screenshots, the columns are:
        # 0: Row number (not needed)
        # 1: Course code
        # 2: Section
        # 3: Faculty/Instructor
        # 4: Time
        # 5: Room
        # 6: Seats Available
        
        course_data = {
            'course_code': cols[1].text.strip(),
            'section': cols[2].text.strip(),
            'instructor': cols[3].text.strip(),
            'day_time': cols[4].text.strip(),
            'room': cols[5].text.strip(),
            'seats': cols[6].text.strip() if len(cols) > 6 else "0"
        }
        
        # Add title and credit fields (will need to be populated separately or inferred)
        course_data['title'] = ""  # Will need to be added later
        course_data['credit'] = ""  # Will need to be added later
        
        # Add parsed day and time fields
        day_time = course_data['day_time']
        course_data['days'] = extract_days(day_time)
        course_data['start_time'], course_data['end_time'] = extract_times(day_time)
        
        courses.append(course_data)
    
    df = pd.DataFrame(courses)
    
    # Clean and process the data
    df = clean_data(df)
    
    return df

def extract_days(day_time_str):
    """
    Extract the days from a day_time string.
    
    Args:
        day_time_str (str): String containing day and time information (e.g., "ST 01:00 PM - 02:30 PM")
    
    Returns:
        str: Days part of the string (e.g., "ST", "MW", "RA")
    """
    if not day_time_str or pd.isna(day_time_str):
        return ""
    
    # From screenshots, days come before the time
    # Extract all letters at the beginning of the string
    days = ""
    for char in day_time_str:
        if char.isalpha():
            days += char
        elif char.isdigit() or char.isspace():
            break
    
    return days.strip()

def extract_times(day_time_str):
    """
    Extract start and end times from day_time string.
    
    Args:
        day_time_str (str): String containing day and time information (e.g., "ST 01:00 PM - 02:30 PM")
    
    Returns:
        tuple: (start_time, end_time) as strings
    """
    if not day_time_str or pd.isna(day_time_str):
        return "", ""
    
    try:
        # From the screenshots, format is like "ST 01:00 PM - 02:30 PM"
        # Remove the day codes at the beginning
        time_part = day_time_str
        for i, char in enumerate(day_time_str):
            if char.isdigit():
                time_part = day_time_str[i:].strip()
                break
        
        # Split by the " - " separator
        if " - " in time_part:
            start_time, end_time = time_part.split(" - ")
            return start_time.strip(), end_time.strip()
        else:
            return time_part.strip(), ""
    except Exception:
        return "", ""

def clean_data(df):
    """
    Clean and standardize the DataFrame.
    
    Args:
        df (pandas.DataFrame): Raw DataFrame
    
    Returns:
        pandas.DataFrame: Cleaned DataFrame
    """
    # Convert section to string
    df['section'] = df['section'].astype(str)
    
    # Convert seats to integer
    df['seats'] = pd.to_numeric(df['seats'], errors='coerce').fillna(0).astype(int)
    
    # Handle special cases for course codes
    # For example, CSE332 and CSE332L may have different formats
    
    # Add credit information based on course code
    # This could be loaded from a separate mapping file or hardcoded
    credit_map = {
        'BIO103': 3,
        'CHE101L': 1,
        'CSE327': 3,
        'CSE332': 3,
        'CSE332L': 0,
        'EEE452': 3,
        'ENG115': 3,
        'PHY108L': 1
    }
    
    # Add title information
    title_map = {
        'BIO103': 'Biology',
        'CHE101L': 'Chemistry Lab',
        'CSE327': 'Software Engineering',
        'CSE332': 'Computer Architecture',
        'CSE332L': 'Computer Architecture Lab',
        'EEE452': 'Digital Signal Processing',
        'ENG115': 'English Writing',
        'PHY108L': 'Physics Lab'
    }
    
    # Apply credit and title mappings
    df['credit'] = df['course_code'].map(lambda x: credit_map.get(x, 0))
    df['title'] = df['course_code'].map(lambda x: title_map.get(x, "Unknown"))
    
    return df

def filter_target_courses(df):
    """
    Filter the DataFrame to include only the target courses.
    
    Args:
        df (pandas.DataFrame): DataFrame containing all courses
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with only target courses
    """
    # Create a mapping for cross-listed courses
    crosslisted_courses = {
        "CSE332/EEE336": "CSE332",
        "CSE332L/EEE336L": "CSE332L"
    }
    
    # Replace cross-listed course codes with their standard codes
    df['filtered_code'] = df['course_code'].map(lambda x: crosslisted_courses.get(x, x))
    
    # Check if filtered_code is in the target courses list
    mask = df['filtered_code'].isin(TARGET_COURSES)
    
    # Drop the temporary column
    result = df[mask].copy()
    if 'filtered_code' in result.columns:
        result.drop('filtered_code', axis=1, inplace=True)
    
    return result

if __name__ == "__main__":
    # For testing
    try:
        print("Fetching course data...")
        df = fetch_course_data()
        print(f"Successfully fetched {len(df)} course sections")
        print("\nSample data:")
        print(df.head())
        
        # Show unique values in day_time column
        print("\nUnique day/time patterns:")
        print(df['day_time'].unique())
        
        # Show day/time parsing results
        print("\nDay/time parsing examples:")
        for day_time in df['day_time'].unique()[:5]:  # Show first 5 examples
            days = extract_days(day_time)
            start_time, end_time = extract_times(day_time)
            print(f"Original: '{day_time}' → Days: '{days}', Start: '{start_time}', End: '{end_time}'")
        
    except Exception as e:
        print(f"Error: {str(e)}") 
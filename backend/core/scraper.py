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
import json

# Add the parent directory to the path so we can import from config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from config.settings import (
    NSU_COURSE_URL, TARGET_COURSES, 
    USER_AGENT, REQUEST_TIMEOUT,
    REQUEST_DELAY_MIN, REQUEST_DELAY_MAX,
    USE_MOCK_DATA
)

def fetch_course_data():
    """
    Fetch course data from the NSU website and parse it into a DataFrame.
    If USE_MOCK_DATA is True, use mock data instead.
    
    Returns:
        pandas.DataFrame: DataFrame containing course information
    """
    if USE_MOCK_DATA:
        print("Using mock data instead of fetching from university website")
        return load_mock_data()
    
    try:
        html_content = fetch_page()
        courses_df = parse_html_to_dataframe(html_content)
    
        # Print number of courses before filtering
        print(f"Total courses fetched before filtering: {len(courses_df)}")
        
        courses_df = filter_target_courses(courses_df)
        return courses_df
    except Exception as e:
        # If fetching from the website fails, try to load cached data first
        cached_df = load_cached_course_data()
        if cached_df is not None:
            print(f"Using cached data due to fetch error: {str(e)}")
            return cached_df
        
        # If no cached data, try mock data
        print(f"Using mock data due to fetch error: {str(e)}")
        return load_mock_data()

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

def save_course_data(df, filename='data/latest_courses.csv'):
    """
    Save course data to a CSV file for caching/later use.
    
    Args:
        df (pandas.DataFrame): DataFrame to save
        filename (str): Path to save the file
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    
    # Save to CSV
    df.to_csv(filename, index=False)
    print(f"Course data saved to {filename}")

def load_cached_course_data(filename='data/latest_courses.csv'):
    """
    Load course data from a cached CSV file.
    
    Args:
        filename (str): Path to the cached file
    
    Returns:
        pandas.DataFrame: DataFrame from cache, or None if not available
    """
    try:
        if os.path.exists(filename):
            df = pd.read_csv(filename)
            print(f"Loaded cached data from {filename}")
            return df
        return None
    except Exception as e:
        print(f"Error loading cached data: {str(e)}")
        return None

def load_mock_data():
    """
    Load mock course data for development and testing.
    
    Returns:
        pandas.DataFrame: DataFrame with mock course data
    """
    mock_file = os.path.join(os.path.dirname(__file__), '..', 'data', 'mock_courses.json')
    
    try:
        if os.path.exists(mock_file):
            with open(mock_file, 'r') as f:
                mock_data = json.load(f)
            
            df = pd.DataFrame(mock_data)
            print(f"Loaded mock data with {len(df)} courses")
            return df
        else:
            # If mock file doesn't exist, create basic mock data
            print(f"Mock data file not found at {mock_file}, creating basic mock data")
            return create_basic_mock_data()
    except Exception as e:
        print(f"Error loading mock data: {str(e)}")
        return create_basic_mock_data()

def create_basic_mock_data():
    """
    Create basic mock data for testing when no mock file exists.
    
    Returns:
        pandas.DataFrame: DataFrame with basic mock course data
    """
    # Create a list of basic course data
    mock_courses = []
    
    # Add mock data for each target course
    for course_code in TARGET_COURSES:
        # Create 3 sections for each course
        for section in range(1, 4):
            is_lab = 'L' in course_code
            
            # Determine days based on course type
            if is_lab:
                days_options = ['S', 'T', 'M', 'W', 'R', 'A']
                days = random.sample(days_options, k=1)[0]
            else:
                days_options = ['ST', 'MW']
                days = random.choice(days_options)
            
            # Determine times
            if is_lab:
                start_times = ['09:40 AM', '11:20 AM', '01:00 PM', '02:40 PM']
                start_time = random.choice(start_times)
                end_time = '11:10 AM' if start_time == '09:40 AM' else '12:50 PM' if start_time == '11:20 AM' else '02:30 PM' if start_time == '01:00 PM' else '04:10 PM'
            else:
                start_times = ['11:20 AM', '01:00 PM', '02:40 PM', '04:20 PM']
                start_time = random.choice(start_times)
                end_time = '12:50 PM' if start_time == '11:20 AM' else '02:30 PM' if start_time == '01:00 PM' else '04:10 PM' if start_time == '02:40 PM' else '05:50 PM'
            
            # Create day_time string
            day_time = f"{days} {start_time} - {end_time}"
            
            # Special case for CSE332 and CSE332L - same section numbers
            if course_code == 'CSE332L':
                # Skip this iteration if this isn't a matching section with CSE332
                continue
            
            # Handle special case for CSE327 instructor
            instructor = 'NBM' if course_code == 'CSE327' and section in [1, 7] else f"INS{section}"
            
            course_data = {
                'course_code': course_code,
                'section': str(section),
                'instructor': instructor,
                'day_time': day_time,
                'room': f"NAC{100+section}",
                'seats': random.randint(5, 30),
                'days': days,
                'start_time': start_time,
                'end_time': end_time,
                'title': get_mock_title(course_code),
                'credit': get_mock_credit(course_code)
            }
            
            mock_courses.append(course_data)
    
    # Add CSE332L sections to match CSE332 sections
    for course in mock_courses:
        if course['course_code'] == 'CSE332':
            # Create matching lab section
            lab_section = course.copy()
            lab_section['course_code'] = 'CSE332L'
            lab_section['title'] = 'Computer Architecture Lab'
            lab_section['credit'] = 0
            lab_section['days'] = random.choice(['S', 'T', 'M', 'W'])
            lab_section['start_time'] = '09:40 AM'
            lab_section['end_time'] = '11:10 AM'
            lab_section['day_time'] = f"{lab_section['days']} {lab_section['start_time']} - {lab_section['end_time']}"
            
            mock_courses.append(lab_section)
    
    df = pd.DataFrame(mock_courses)
    return df

def get_mock_title(course_code):
    """Get mock title for a course code"""
    titles = {
        'BIO103': 'Biology',
        'CHE101L': 'Chemistry Lab',
        'CSE327': 'Software Engineering',
        'CSE332': 'Computer Architecture',
        'CSE332L': 'Computer Architecture Lab',
        'EEE452': 'Digital Signal Processing',
        'ENG115': 'English Writing',
        'PHY108L': 'Physics Lab'
    }
    return titles.get(course_code, 'Unknown Course')

def get_mock_credit(course_code):
    """Get mock credit for a course code"""
    credits = {
        'BIO103': 3,
        'CHE101L': 1,
        'CSE327': 3,
        'CSE332': 3,
        'CSE332L': 0,
        'EEE452': 3,
        'ENG115': 3,
        'PHY108L': 1
    }
    return credits.get(course_code, 0)

if __name__ == "__main__":
    # For testing
    try:
        print("Fetching course data...")
        df = fetch_course_data()
        print(f"Successfully fetched {len(df)} course sections")
        print("\nSample data:")
        print(df.head())
        
        # Save for future use
        save_course_data(df)
        
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
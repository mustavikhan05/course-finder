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

# URL will need to be updated with the actual NSU course offerings page
NSU_COURSE_URL = "https://rds2.northsouth.edu/index.php/common/showofferings"

# Target courses to filter for
TARGET_COURSES = [
    "BIO 103",
    "CSE 327",
    "CSE 332",
    "EEE 452",
    "ENG 115",
    "PHY108L",
    "CHE101L"
]

def fetch_course_data():
    """
    Fetch course data from the NSU website and parse it into a DataFrame.
    
    Returns:
        pandas.DataFrame: DataFrame containing course information
    """
    html_content = fetch_page()
    courses_df = parse_html_to_dataframe(html_content)
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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Connection': 'keep-alive',
    }
    
    try:
        # Add a small random delay to avoid overloading the server
        time.sleep(random.uniform(0.5, 1.5))
        
        response = requests.get(NSU_COURSE_URL, headers=headers, timeout=10)
        
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
    
    # This will need to be updated based on actual HTML structure
    # The following is a placeholder implementation
    table = soup.find('table', {'class': 'offerings-table'})  # Update with actual table class
    
    if not table:
        raise Exception("Could not find course offerings table in the HTML")
    
    courses = []
    rows = table.find_all('tr')[1:]  # Skip header row
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) < 7:
            continue
        
        course_data = {
            'course_code': cols[0].text.strip(),
            'section': cols[1].text.strip(),
            'title': cols[2].text.strip(),
            'credit': cols[3].text.strip(),
            'day_time': cols[4].text.strip(),
            'room': cols[5].text.strip(),
            'instructor': cols[6].text.strip(),
            'seats': cols[7].text.strip() if len(cols) > 7 else "N/A"
        }
        
        # Add parsed day and time fields
        day_time = course_data['day_time']
        course_data['days'] = extract_days(day_time)
        course_data['start_time'], course_data['end_time'] = extract_times(day_time)
        
        courses.append(course_data)
    
    return pd.DataFrame(courses)

def extract_days(day_time_str):
    """
    Extract the days from a day_time string.
    
    Args:
        day_time_str (str): String containing day and time information
    
    Returns:
        str: Days part of the string (e.g., "ST", "MW", "SMW")
    """
    # This function will need to be adjusted based on actual data format
    # Example format might be "ST 1:00 PM - 2:30 PM"
    if not day_time_str or pd.isna(day_time_str):
        return ""
    
    # Assuming days are at the start of the string before any digits
    days = ""
    for char in day_time_str:
        if char.isalpha() and char in "SMTWRF":
            days += char
        elif char.isdigit() or char == ':':
            break
    
    return days.strip()

def extract_times(day_time_str):
    """
    Extract start and end times from day_time string.
    
    Args:
        day_time_str (str): String containing day and time information
    
    Returns:
        tuple: (start_time, end_time) as strings
    """
    # This function will need to be adjusted based on actual data format
    if not day_time_str or pd.isna(day_time_str):
        return "", ""
    
    # Example: "ST 1:00 PM - 2:30 PM"
    # Remove days part and extract time range
    time_part = ''.join([c for c in day_time_str if c.isdigit() or c in ":APM -"])
    
    try:
        start_time, end_time = time_part.split('-')
        return start_time.strip(), end_time.strip()
    except ValueError:
        return "", ""

def filter_target_courses(df):
    """
    Filter the DataFrame to include only the target courses.
    
    Args:
        df (pandas.DataFrame): DataFrame containing all courses
    
    Returns:
        pandas.DataFrame: Filtered DataFrame with only target courses
    """
    # Check if course_code starts with any of the target courses
    mask = df['course_code'].apply(lambda x: any(x.startswith(course) for course in TARGET_COURSES))
    return df[mask]

if __name__ == "__main__":
    # For testing
    try:
        df = fetch_course_data()
        print(f"Successfully fetched {len(df)} course sections")
        print(df.head())
    except Exception as e:
        print(f"Error: {str(e)}") 
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
    NSU_COURSE_URL, USER_AGENT, REQUEST_TIMEOUT,
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
    
    # Print number of courses fetched
    print(f"Total courses fetched: {len(courses_df)}")
    print("\nAvailable course codes:")
    print(courses_df['course_code'].unique())
    
    return courses_df

def fetch_page():
    """
    Fetch the course offerings page from NSU website.
    
    Returns:
        str: HTML content of the page
    """
    headers = {
        'User-Agent': USER_AGENT
    }
    
    try:
        response = requests.get(
            NSU_COURSE_URL,
            headers=headers,
            timeout=REQUEST_TIMEOUT
        )
        response.raise_for_status()
        return response.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching page: {str(e)}")
        raise

def parse_html_to_dataframe(html_content):
    """
    Parse HTML content into a pandas DataFrame.
    
    Args:
        html_content (str): HTML content of the course offerings page
    
    Returns:
        pandas.DataFrame: DataFrame containing course information
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    table = soup.find('table', {'id': 'offeredCourseTbl'})
    
    if not table:
        raise ValueError("Course table not found in the page")
    
    rows = table.find_all('tr')[1:]  # Skip header row
    data = []
    
    for row in rows:
        cols = row.find_all('td')
        if len(cols) >= 7:
            course_code = cols[1].text.strip()
            section = cols[2].text.strip()
            instructor = cols[3].text.strip()
            time_str = cols[4].text.strip()
            room = cols[5].text.strip()
            seats = cols[6].text.strip()
            
            # Parse time string
            days, times = parse_time_string(time_str)
            
            data.append({
                'course_code': course_code,
                'section': section,
                'instructor': instructor,
                'days': days,
                'start_time': times[0] if times else '',
                'end_time': times[1] if len(times) > 1 else '',
                'room': room,
                'seats': int(seats) if seats.isdigit() else 0
            })
    
    return pd.DataFrame(data)

def parse_time_string(time_str):
    """
    Parse time string into days and times.
    
    Args:
        time_str (str): Time string in format "DAYS START_TIME - END_TIME"
    
    Returns:
        tuple: (days, [start_time, end_time])
    """
    parts = time_str.split()
    if len(parts) < 3:
        return '', []
    
    days = parts[0]
    times = ' '.join(parts[1:]).split(' - ')
    
    return days, times

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
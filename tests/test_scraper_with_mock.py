#!/usr/bin/env python3
"""
Test script for the scraper module using a mock HTML file.
This allows us to test the parsing logic without needing to connect to the actual NSU website.
"""

import sys
import os
import datetime
import traceback

# Add the parent directory to the path so we can import the src modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.scraper import (
    parse_html_to_dataframe,
    extract_days,
    extract_times,
    filter_target_courses,
    clean_data
)

def load_mock_html():
    """Load the mock HTML file for testing."""
    print("Loading mock HTML file...")
    try:
        mock_file_path = os.path.join(os.path.dirname(__file__), 'mock_nsu_page.html')
        with open(mock_file_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        print("✅ Mock HTML loaded successfully!")
        return html_content
    except Exception as e:
        print(f"❌ Failed to load mock HTML: {str(e)}")
        traceback.print_exc()
        return None

def test_html_parsing(html_content):
    """Test the HTML parsing functionality."""
    print("\nTesting HTML parsing functionality...")
    try:
        df = parse_html_to_dataframe(html_content)
        print(f"✅ Successfully parsed {len(df)} course sections")
        
        # Save the parsed data
        os.makedirs('data', exist_ok=True)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"data/mock_parsed_courses_{timestamp}.csv"
        df.to_csv(filename, index=False)
        print(f"✅ Saved parsed data to {filename}")
        
        # Display sample data
        print("\nSample data (first 5 rows):")
        print(df.head().to_string())
        
        # Display column info
        print("\nDataFrame Info:")
        df_info = df.info()
        
        # Check if we have all expected columns
        expected_columns = [
            'course_code', 'section', 'instructor', 'day_time', 
            'room', 'seats', 'title', 'credit', 'days', 
            'start_time', 'end_time'
        ]
        missing_columns = [col for col in expected_columns if col not in df.columns]
        if missing_columns:
            print(f"❌ Missing expected columns: {missing_columns}")
        else:
            print("✅ All expected columns are present")
        
        return df
    except Exception as e:
        print(f"❌ HTML parsing failed: {str(e)}")
        traceback.print_exc()
        return None

def test_time_parsing(df):
    """Test the day/time parsing functionality."""
    print("\nTesting day/time parsing functionality...")
    try:
        if df is None or len(df) == 0:
            print("❌ No data to test day/time parsing")
            return
        
        # Display unique day/time formats
        print("\nUnique day/time formats:")
        unique_day_times = df['day_time'].unique()
        for i, day_time in enumerate(unique_day_times[:10]):  # Show first 10
            days = extract_days(day_time)
            start_time, end_time = extract_times(day_time)
            print(f"{i+1}. '{day_time}' → Days: '{days}', Start: '{start_time}', End: '{end_time}'")
        
        # Count occurrences of each day pattern
        print("\nDay pattern counts:")
        day_patterns = df['days'].value_counts()
        for day, count in day_patterns.items():
            print(f"'{day}': {count} occurrences")
        
        # Count time ranges
        print("\nTime range counts:")
        time_ranges = df.apply(lambda x: f"{x['start_time']} - {x['end_time']}", axis=1).value_counts()
        for time_range, count in time_ranges.head(10).items():
            print(f"'{time_range}': {count} occurrences")
    except Exception as e:
        print(f"❌ Time parsing test failed: {str(e)}")
        traceback.print_exc()

def test_target_course_filtering(df):
    """Test filtering for target courses."""
    print("\nTesting target course filtering...")
    try:
        if df is None or len(df) == 0:
            print("❌ No data to test filtering")
            return
        
        # Display course code counts before filtering
        print("\nCourse code counts before filtering:")
        course_counts = df['course_code'].value_counts()
        for course, count in course_counts.items():
            print(f"'{course}': {count} sections")
        
        # Filter for target courses
        filtered_df = filter_target_courses(df)
        
        # Display filtered course counts
        print("\nCourse code counts after filtering:")
        if len(filtered_df) == 0:
            print("❌ No target courses found in the data")
            print("\nAvailable course codes:")
            available_courses = df['course_code'].unique()
            for i, course in enumerate(sorted(available_courses)):
                print(f"{course}", end=", " if i < len(available_courses) - 1 else "")
                if (i + 1) % 5 == 0:
                    print()
            print("\n")
        else:
            filtered_counts = filtered_df['course_code'].value_counts()
            for course, count in filtered_counts.items():
                print(f"'{course}': {count} sections")
            
            # Display filtered data
            print("\nFiltered data (first 10 rows):")
            print(filtered_df.head(10).to_string())
        
        return filtered_df
    except Exception as e:
        print(f"❌ Filtering test failed: {str(e)}")
        traceback.print_exc()
        return None

def main():
    """Main test function."""
    print("==== SCRAPER MODULE TEST WITH MOCK DATA ====")
    print(f"Test started at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    # Load mock HTML
    html_content = load_mock_html()
    if html_content is None:
        print("❌ Cannot proceed with tests due to mock HTML loading failure")
        return
    
    # Test HTML parsing
    df = test_html_parsing(html_content)
    if df is None:
        print("❌ Cannot proceed with tests due to parsing failure")
        return
    
    # Test day/time parsing
    test_time_parsing(df)
    
    # Test target course filtering
    filtered_df = test_target_course_filtering(df)
    
    print("\n==== TEST SUMMARY ====")
    if html_content and df is not None:
        print("✅ Mock HTML loading: PASSED")
        print(f"✅ HTML parsing test: PASSED ({len(df)} courses parsed)")
        if filtered_df is not None:
            print(f"✅ Filtering test: PASSED ({len(filtered_df)} target courses found)")
        else:
            print("❌ Filtering test: FAILED")
    else:
        print("❌ Tests FAILED. Check errors above.")
    
    print(f"\nTest completed at: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 
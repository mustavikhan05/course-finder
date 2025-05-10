#!/usr/bin/env python3
"""
Tests for the filters module.
"""

import unittest
import pandas as pd
import sys
import os

# Add the parent directory to the path so we can import the src modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.filters import (
    is_after_12pm,
    is_st_mw_only,
    filter_after_12pm,
    filter_st_mw_only,
    filter_cse327_sections,
    has_same_section_cse332,
    count_days_in_schedule
)

class TestFilters(unittest.TestCase):
    """Test case for the filters module."""
    
    def setUp(self):
        """Set up test fixtures."""
        # Sample test data
        self.test_data = {
            'course_code': ['CSE 327', 'CSE 327', 'CSE 332', 'CSE 332', 'BIO 103'],
            'section': ['1', '2', '3', '3', '5'],
            'title': ['Software Engineering', 'Software Engineering', 'Computer Architecture', 'Computer Architecture Lab', 'Biology'],
            'credit': ['3', '3', '3', '1', '3'],
            'day_time': ['ST 1:00 PM - 2:30 PM', 'MW 3:00 PM - 4:30 PM', 'ST 2:00 PM - 3:30 PM', 'W 2:00 PM - 5:00 PM', 'MT 11:00 AM - 12:30 PM'],
            'room': ['NAC 723', 'SAC 607', 'NAC 824', 'NAC 824', 'SAC 507'],
            'instructor': ['NBM', 'TBA', 'TBA', 'TBA', 'TBA'],
            'seats': ['35', '40', '45', '45', '30'],
            'days': ['ST', 'MW', 'ST', 'W', 'MT'],
            'start_time': ['1:00 PM', '3:00 PM', '2:00 PM', '2:00 PM', '11:00 AM'],
            'end_time': ['2:30 PM', '4:30 PM', '3:30 PM', '5:00 PM', '12:30 PM']
        }
        self.df = pd.DataFrame(self.test_data)
        
    def test_is_after_12pm(self):
        """Test is_after_12pm function."""
        self.assertTrue(is_after_12pm("1:00 PM"))
        self.assertTrue(is_after_12pm("12:30 PM"))
        self.assertFalse(is_after_12pm("11:00 AM"))
        self.assertFalse(is_after_12pm(""))
        self.assertFalse(is_after_12pm(None))
        
    def test_is_st_mw_only(self):
        """Test is_st_mw_only function."""
        self.assertTrue(is_st_mw_only("ST"))
        self.assertTrue(is_st_mw_only("MW"))
        self.assertTrue(is_st_mw_only("S"))
        self.assertTrue(is_st_mw_only("M"))
        self.assertTrue(is_st_mw_only("T"))
        self.assertTrue(is_st_mw_only("W"))
        self.assertFalse(is_st_mw_only("MTW"))
        self.assertFalse(is_st_mw_only("STW"))
        self.assertFalse(is_st_mw_only("MR"))
        self.assertFalse(is_st_mw_only("RF"))
        self.assertFalse(is_st_mw_only(""))
        self.assertFalse(is_st_mw_only(None))
        
    def test_filter_after_12pm(self):
        """Test filter_after_12pm function."""
        filtered = filter_after_12pm(self.df)
        self.assertEqual(len(filtered), 4)  # All except BIO 103 which is at 11:00 AM
        
    def test_filter_st_mw_only(self):
        """Test filter_st_mw_only function."""
        filtered = filter_st_mw_only(self.df)
        self.assertEqual(len(filtered), 4)  # All except BIO 103 which has MT days
        
    def test_filter_cse327_sections(self):
        """Test filter_cse327_sections function."""
        filtered = filter_cse327_sections(self.df)
        # Should keep the CSE 327 section 1 with NBM, and remove section 2
        cse327_sections = filtered[filtered['course_code'] == 'CSE 327']
        self.assertEqual(len(cse327_sections), 1)
        self.assertEqual(cse327_sections.iloc[0]['section'], '1')
        
    def test_count_days_in_schedule(self):
        """Test count_days_in_schedule function."""
        # Create a schedule with ST and MW day combinations
        schedule = [
            {'days': 'ST', 'course_code': 'CSE 332'},
            {'days': 'MW', 'course_code': 'CSE 327'},
            {'days': 'S', 'course_code': 'BIO 103'}
        ]
        self.assertEqual(count_days_in_schedule(schedule), 4)  # S, T, M, W = 4 days
        
        schedule = [
            {'days': 'ST', 'course_code': 'CSE 332'},
            {'days': 'ST', 'course_code': 'BIO 103'}
        ]
        self.assertEqual(count_days_in_schedule(schedule), 2)  # S, T = 2 days

if __name__ == '__main__':
    unittest.main() 
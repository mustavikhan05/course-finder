import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableCourses } from '../utils/api';

const FormContainer = styled.form`
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const FormTitle = styled.h3`
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 5px 0;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-right: 15px;
  user-select: none;
`;

const Checkbox = styled.input`
  margin-right: 5px;
`;

const CoursesTagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  min-height: 38px;
  align-items: center;
  
  &:focus-within {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.2);
  }
`;

// Get the department code from a course code
const getDepartment = (course) => {
  const match = course.match(/^([A-Z]{3})/);
  return match ? match[1] : '';
};

// Course badge with department color
const CourseBadge = styled.span`
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: bold;
  color: white;
  background-color: ${props => {
    // Choose color based on course department
    const dept = getDepartment(props.course);
    if (dept === 'CSE') return '#4a90e2'; // Blue
    if (dept === 'EEE') return '#50b83c'; // Green
    if (dept === 'MAT') return '#8c4bff'; // Purple
    if (dept === 'BIO') return '#f08a24'; // Orange
    if (dept === 'PHY') return '#d8315b'; // Red
    if (dept === 'CHE') return '#639'; // Indigo
    if (dept === 'ENG') return '#4b8e8d'; // Teal
    return '#8c8c8c'; // Gray for others
  }};
`;

const CourseTag = styled.div`
  background-color: ${props => {
    // Choose color based on course department
    const dept = getDepartment(props.course);
    if (dept === 'CSE') return '#e3f2fd'; // Light Blue
    if (dept === 'EEE') return '#e8f5e9'; // Light Green
    if (dept === 'MAT') return '#f3e5f5'; // Light Purple
    if (dept === 'BIO') return '#fff3e0'; // Light Orange
    if (dept === 'PHY') return '#ffebee'; // Light Red
    if (dept === 'CHE') return '#e1e4f2'; // Light Indigo
    if (dept === 'ENG') return '#e0f2f1'; // Light Teal
    return '#f5f5f5'; // Light Gray for others
  }};
  border: 1px solid ${props => {
    // Choose color based on course department
    const dept = getDepartment(props.course);
    if (dept === 'CSE') return '#bbdefb'; // Blue border
    if (dept === 'EEE') return '#c8e6c9'; // Green border
    if (dept === 'MAT') return '#e1bee7'; // Purple border
    if (dept === 'BIO') return '#ffe0b2'; // Orange border
    if (dept === 'PHY') return '#ffcdd2'; // Red border
    if (dept === 'CHE') return '#c5cae9'; // Indigo border
    if (dept === 'ENG') return '#b2dfdb'; // Teal border
    return '#e0e0e0'; // Gray border for others
  }};
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: ${props => {
    // Text color based on department
    const dept = getDepartment(props.course);
    if (dept === 'CSE') return '#1565c0'; // Blue text
    if (dept === 'EEE') return '#2e7d32'; // Green text
    if (dept === 'MAT') return '#6a1b9a'; // Purple text
    if (dept === 'BIO') return '#e65100'; // Orange text
    if (dept === 'PHY') return '#c62828'; // Red text
    if (dept === 'CHE') return '#283593'; // Indigo text
    if (dept === 'ENG') return '#00695c'; // Teal text
    return '#424242'; // Gray text for others
  }};
`;

const RemoveCourseBtn = styled.button`
  background: none;
  border: none;
  color: #666;
  margin-left: 5px;
  cursor: pointer;
  font-size: 14px;
  padding: 0 3px;
  
  &:hover {
    color: #c00;
  }
`;

const CourseInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 120px;
  font-size: 14px;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(Button)`
  background-color: #4a90e2;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #3a80d2;
  }
`;

const ResetButton = styled(Button)`
  background-color: #f0f0f0;
  color: #666;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const HelperText = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 4px;
`;

const ErrorText = styled.div`
  color: #c00;
  font-size: 12px;
  margin-top: 4px;
`;

// Dropdown components
const DropdownList = styled.ul`
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  border: 1px solid #ddd;
  border-top: none;
  border-radius: 0 0 4px 4px;
  background-color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  z-index: 10;
  list-style: none;
`;

const DropdownItem = styled.li`
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  
  &:hover {
    background-color: #f5f8ff;
  }
  
  &.highlighted {
    background-color: #e1f0fe;
  }
`;

const InstructorRowContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 10px;
`;

const InstructorLabel = styled.div`
  width: 80px;
  font-size: 14px;
  color: #555;
`;

const InstructorInputContainer = styled.div`
  flex: 1;
  position: relative;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 15px;
  color: #666;
  font-style: italic;
`;

const ErrorIndicator = styled.div`
  padding: 10px;
  margin-bottom: 15px;
  color: #c00;
  background-color: #fee;
  border-radius: 4px;
  border: 1px solid #fcc;
`;

// Default constraints
const DEFAULT_CONSTRAINTS = {
  required_courses: ["BIO103", "CSE327", "CSE332", "EEE452", "ENG115", "CHE101L", "PHY108L"],
  start_time_constraint: "11:00 AM",
  day_pattern: ["ST", "MW"],
  exclude_evening_classes: true,
  max_days: 5,
  instructor_preferences: {}
};

// Time options for the dropdown
const TIME_OPTIONS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

// Day pattern options
const DAY_PATTERNS = [
  { value: "ST", label: "Sunday-Tuesday (ST)" },
  { value: "MW", label: "Monday-Wednesday (MW)" },
  { value: "RA", label: "Thursday-Saturday (RA)" }
];

// Fallback courses in case API fails
const FALLBACK_COURSES = [
  "BIO103", "CSE327", "CSE332", "EEE452", "ENG115", "CHE101L", "PHY108L"
];

// Fallback instructors
const FALLBACK_INSTRUCTORS = ["TBA", "NBM", "ARF"];

// Course dropdown item with title
const CourseDropdownItem = ({ course, title, onClick, isHighlighted }) => (
  <DropdownItem
    className={isHighlighted ? 'highlighted' : ''}
    onClick={onClick}
  >
    <CourseBadge course={course}>{getDepartment(course)}</CourseBadge>
    <div style={{ marginLeft: 8 }}>
      <div>{course}</div>
      {title && <div style={{ fontSize: '11px', color: '#666' }}>{title}</div>}
    </div>
  </DropdownItem>
);

function CourseConstraintsForm({ onSubmit, isLoading }) {
  // Fetch available courses from API
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isCoursesError
  } = useQuery({
    queryKey: ['availableCourses'],
    queryFn: fetchAvailableCourses,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false
  });
  
  // State for form
  const [constraints, setConstraints] = useState(() => {
    const savedConstraints = localStorage.getItem('courseConstraints');
    return savedConstraints ? JSON.parse(savedConstraints) : DEFAULT_CONSTRAINTS;
  });
  
  const [courseInput, setCourseInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const courseDropdownRef = useRef(null);
  
  // Get available courses from API data or use fallback
  const availableCourses = React.useMemo(() => {
    if (coursesData?.courses) {
      return Object.keys(coursesData.courses);
    }
    return FALLBACK_COURSES;
  }, [coursesData]);
  
  // Helper to get course title
  const getCourseTitle = (course) => {
    if (coursesData?.courses?.[course]?.title) {
      return coursesData.courses[course].title;
    }
    return '';
  };
  
  // Helper to get instructors for a course
  const getInstructorsForCourse = (course) => {
    if (coursesData?.courses?.[course]?.instructors) {
      return coursesData.courses[course].instructors;
    }
    return FALLBACK_INSTRUCTORS;
  };
  
  // Save constraints to localStorage
  const saveConstraints = (newConstraints) => {
    localStorage.setItem('courseConstraints', JSON.stringify(newConstraints));
    setConstraints(newConstraints);
  };
  
  // Filter courses based on input
  useEffect(() => {
    if (courseInput.trim() === '') {
      // Show first 20 courses
      setFilteredCourses(availableCourses.slice(0, 20));
    } else {
      const input = courseInput.toUpperCase();
      const filtered = availableCourses
        .filter(course => {
          // Skip courses already added
          if (constraints.required_courses.includes(course)) {
            return false;
          }
          
          // Exact prefix match
          if (course.startsWith(input)) {
            return true;
          }
          
          // Contains the input
          if (course.includes(input)) {
            return true;
          }
          
          // Match department for short inputs
          if (input.length <= 3) {
            return course.substring(0, 3) === input;
          }
          
          // Match by title if available
          const title = getCourseTitle(course);
          if (title && title.toUpperCase().includes(input)) {
            return true;
          }
          
          return false;
        })
        // Sort: prefix matches first, then contains, then title matches
        .sort((a, b) => {
          if (a.startsWith(input) && !b.startsWith(input)) return -1;
          if (!a.startsWith(input) && b.startsWith(input)) return 1;
          return 0;
        })
        .slice(0, 20); // Limit to 20 results
      
      setFilteredCourses(filtered);
    }
  }, [courseInput, constraints.required_courses, availableCourses, getCourseTitle]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(e.target)) {
        setShowCourseDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle course selection
  const handleCourseSelect = (course) => {
    if (!constraints.required_courses.includes(course)) {
      saveConstraints({
        ...constraints,
        required_courses: [...constraints.required_courses, course]
      });
    }
    setCourseInput('');
    setShowCourseDropdown(false);
  };
  
  // Handle course input change
  const handleCourseInputChange = (e) => {
    setCourseInput(e.target.value.toUpperCase());
    setShowCourseDropdown(true);
  };
  
  // Handle key events in course input
  const handleCourseInputKeyDown = (e) => {
    if (e.key === 'Enter' && courseInput.trim()) {
      e.preventDefault();
      
      // Select first matching course or add custom
      if (filteredCourses.length > 0) {
        handleCourseSelect(filteredCourses[0]);
      } else {
        // Add custom course
        handleCourseSelect(courseInput.trim());
      }
    } else if (e.key === 'Escape') {
      setShowCourseDropdown(false);
    }
  };
  
  // Remove a course
  const handleCourseRemove = (course) => {
    // Remove course from required courses
    const newCourses = constraints.required_courses.filter(c => c !== course);
    
    // Also remove any instructor preference for this course
    const newPreferences = { ...constraints.instructor_preferences };
    delete newPreferences[course];
    
    saveConstraints({
      ...constraints,
      required_courses: newCourses,
      instructor_preferences: newPreferences
    });
  };
  
  // Update any constraint
  const handleInputChange = (field, value) => {
    saveConstraints({ ...constraints, [field]: value });
  };
  
  // Handle day pattern changes
  const handleDayPatternChange = (pattern, isChecked) => {
    let newPatterns;
    
    if (isChecked) {
      newPatterns = [...constraints.day_pattern, pattern];
    } else {
      newPatterns = constraints.day_pattern.filter(p => p !== pattern);
    }
    
    saveConstraints({ ...constraints, day_pattern: newPatterns });
  };
  
  // Update instructor preference
  const handleInstructorPreferenceChange = (course, instructor) => {
    const newPreferences = { ...constraints.instructor_preferences };
    
    if (instructor.trim()) {
      newPreferences[course] = instructor.trim();
    } else {
      delete newPreferences[course];
    }
    
    saveConstraints({ ...constraints, instructor_preferences: newPreferences });
  };
  
  // Reset to defaults
  const resetForm = () => {
    saveConstraints(DEFAULT_CONSTRAINTS);
    setErrors({});
  };
  
  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (constraints.required_courses.length === 0) {
      newErrors.required_courses = 'At least one course is required';
    }
    
    if (constraints.day_pattern.length === 0) {
      newErrors.day_pattern = 'At least one day pattern must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(constraints);
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormTitle>Custom Schedule Constraints</FormTitle>
      
      {isLoadingCourses && (
        <LoadingIndicator>Loading available courses and instructors...</LoadingIndicator>
      )}
      
      {isCoursesError && (
        <ErrorIndicator>
          Error loading course data. Using fallback values.
        </ErrorIndicator>
      )}
      
      <FormGroup>
        <Label htmlFor="required_courses">Required Courses:</Label>
        <CoursesTagInput>
          {constraints.required_courses.map(course => (
            <CourseTag key={course} course={course}>
              {course}
              <RemoveCourseBtn 
                type="button" 
                onClick={() => handleCourseRemove(course)}
                aria-label={`Remove ${course}`}
              >
                ×
              </RemoveCourseBtn>
            </CourseTag>
          ))}
          <div ref={courseDropdownRef} style={{ flex: 1, position: 'relative' }}>
            <CourseInput
              id="course_input"
              value={courseInput}
              onChange={handleCourseInputChange}
              onKeyDown={handleCourseInputKeyDown}
              onFocus={() => setShowCourseDropdown(true)}
              placeholder="Add course..."
              autoComplete="off"
            />
            {showCourseDropdown && filteredCourses.length > 0 && (
              <DropdownList>
                {filteredCourses.map(course => (
                  <CourseDropdownItem
                    key={course}
                    course={course}
                    title={getCourseTitle(course)}
                    onClick={() => handleCourseSelect(course)}
                    isHighlighted={course === courseInput}
                  />
                ))}
              </DropdownList>
            )}
          </div>
        </CoursesTagInput>
        {errors.required_courses && <ErrorText>{errors.required_courses}</ErrorText>}
        <HelperText>Type to search courses or press Enter to add custom course</HelperText>
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="start_time_constraint">Minimum Start Time (for lectures):</Label>
        <Select 
          id="start_time_constraint"
          value={constraints.start_time_constraint}
          onChange={(e) => handleInputChange('start_time_constraint', e.target.value)}
        >
          {TIME_OPTIONS.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label>Day Patterns:</Label>
        <CheckboxContainer>
          {DAY_PATTERNS.map(pattern => (
            <CheckboxLabel key={pattern.value}>
              <Checkbox 
                type="checkbox"
                checked={constraints.day_pattern.includes(pattern.value)}
                onChange={(e) => handleDayPatternChange(pattern.value, e.target.checked)}
              />
              {pattern.label}
            </CheckboxLabel>
          ))}
        </CheckboxContainer>
        {errors.day_pattern && <ErrorText>{errors.day_pattern}</ErrorText>}
      </FormGroup>
      
      <FormGroup>
        <Label htmlFor="max_days">Maximum Days Per Week:</Label>
        <Select 
          id="max_days"
          value={constraints.max_days}
          onChange={(e) => handleInputChange('max_days', parseInt(e.target.value, 10))}
        >
          <option value="3">3 days</option>
          <option value="4">4 days</option>
          <option value="5">5 days</option>
          <option value="6">6 days</option>
        </Select>
      </FormGroup>
      
      <FormGroup>
        <Label>Evening Classes:</Label>
        <CheckboxLabel>
          <Checkbox 
            type="checkbox"
            checked={!constraints.exclude_evening_classes}
            onChange={(e) => handleInputChange('exclude_evening_classes', !e.target.checked)}
          />
          Include classes starting at or after 6:00 PM
        </CheckboxLabel>
      </FormGroup>
      
      <FormGroup>
        <Label>Instructor Preferences (optional):</Label>
        <div>
          {constraints.required_courses.map(course => (
            <InstructorRowContainer key={course}>
              <InstructorLabel>{course}:</InstructorLabel>
              <InstructorInputContainer>
                <Select
                  value={constraints.instructor_preferences[course] || ''}
                  onChange={(e) => handleInstructorPreferenceChange(course, e.target.value)}
                >
                  <option value="">Any Instructor</option>
                  {getInstructorsForCourse(course).map(instructor => (
                    <option key={instructor} value={instructor}>
                      {instructor}
                    </option>
                  ))}
                </Select>
              </InstructorInputContainer>
            </InstructorRowContainer>
          ))}
        </div>
        <HelperText>Select preferred instructors for specific courses</HelperText>
      </FormGroup>
      
      <ButtonGroup>
        <ResetButton type="button" onClick={resetForm}>
          Reset to Defaults
        </ResetButton>
        <SubmitButton type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Schedules'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
}

export default CourseConstraintsForm;
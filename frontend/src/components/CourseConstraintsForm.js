import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableCourses } from '../utils/api';

// Assuming colors are accessible or redefined
const colors = {
  primary: '#007bff',
  primaryDark: '#0056b3',
  surface: '#ffffff',
  background: '#f8f9fa', // Use the app background for form container
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  inputFocusBorder: '#80bdff', // Lighter blue for focus
  inputFocusShadow: 'rgba(0, 123, 255, 0.25)',
  error: '#dc3545',
  errorLight: '#f8d7da',
  disabledBg: '#e9ecef',
  disabledColor: '#6c757d',
  // Department specific colors (can be further refined)
  cseBlue: '#007bff', cseBlueLight: '#cfe2ff', cseBlueText: '#004085',
  eeeGreen: '#28a745', eeeGreenLight: '#d4edda', eeeGreenText: '#155724',
  matPurple: '#6f42c1', matPurpleLight: '#e2d9f3', matPurpleText: '#3d2363',
  bioOrange: '#fd7e14', bioOrangeLight: '#ffe8d1', bioOrangeText: '#8b460b',
  phyRed: '#dc3545', phyRedLight: '#f8d7da', phyRedText: '#721c24',
  cheIndigo: '#6610f2', cheIndigoLight: '#e0cffc', cheIndigoText: '#360884',
  engTeal: '#20c997', engTealLight: '#d1f2eb', engTealText: '#0c6b50',
  otherGray: '#6c757d', otherGrayLight: '#e9ecef', otherGrayText: '#343a40',
};

const FormContainer = styled.form`
  background-color: ${colors.surface};
  border-radius: 12px; // Consistent with other cards
  padding: 25px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);

  @media (max-width: 767px) {
    padding: 20px;
  }
`;

const FormTitle = styled.h3`
  font-size: 1.4rem;
  color: ${colors.primary};
  border-bottom: 1px solid ${colors.border};
  padding-bottom: 15px;
  margin-bottom: 25px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  color: ${colors.text};
`;

const inputStyles = `
  width: 100%;
  padding: 10px 12px;
  border: 1px solid ${colors.border};
  border-radius: 6px; // Softer radius
  font-size: 0.95rem;
  color: ${colors.text};
  background-color: ${colors.surface};
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus {
    outline: none;
    border-color: ${colors.inputFocusBorder};
    box-shadow: 0 0 0 0.2rem ${colors.inputFocusShadow};
  }

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.8;
  }
`;

const Input = styled.input`
  ${inputStyles}
`;

const Select = styled.select`
  ${inputStyles}
  appearance: none; // Custom arrow will be needed or use a library
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${colors.textSecondary.substring(1)}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
  padding-right: 30px; // Make space for arrow
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem;
  color: ${colors.text};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${colors.primary};

  &:focus {
    outline: 2px solid ${colors.inputFocusBorder};
    outline-offset: 1px;
  }
`;

const CoursesTagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background-color: ${colors.surface};
  min-height: 42px; // Adjusted min-height
  align-items: center;
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  
  &:focus-within {
    outline: none;
    border-color: ${colors.inputFocusBorder};
    box-shadow: 0 0 0 0.2rem ${colors.inputFocusShadow};
  }
`;

const getDepartmentColors = (course) => {
  const dept = (course.match(/^([A-Z]{3})/) || [])[1];
  switch (dept) {
    case 'CSE': return { bg: colors.cseBlueLight, border: colors.cseBlue, text: colors.cseBlueText };
    case 'EEE': return { bg: colors.eeeGreenLight, border: colors.eeeGreen, text: colors.eeeGreenText };
    case 'MAT': return { bg: colors.matPurpleLight, border: colors.matPurple, text: colors.matPurpleText };
    case 'BIO': return { bg: colors.bioOrangeLight, border: colors.bioOrange, text: colors.bioOrangeText };
    case 'PHY': return { bg: colors.phyRedLight, border: colors.phyRed, text: colors.phyRedText };
    case 'CHE': return { bg: colors.cheIndigoLight, border: colors.cheIndigo, text: colors.cheIndigoText };
    case 'ENG': return { bg: colors.engTealLight, border: colors.engTeal, text: colors.engTealText };
    default: return { bg: colors.otherGrayLight, border: colors.otherGray, text: colors.otherGrayText };
  }
};

const CourseBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem; // Slightly smaller
  font-weight: 600;
  color: ${props => getDepartmentColors(props.course).text};
  background-color: ${props => getDepartmentColors(props.course).bg};
  border: 1px solid ${props => getDepartmentColors(props.course).border};
  line-height: 1.2;
`;

const CourseTag = styled.div`
  background-color: ${props => getDepartmentColors(props.course).bg};
  border: 1px solid ${props => getDepartmentColors(props.course).border};
  border-radius: 5px;
  padding: 4px 10px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => getDepartmentColors(props.course).text};
  font-weight: 500;
`;

const RemoveCourseBtn = styled.button`
  background: none;
  border: none;
  color: currentColor; // Inherit color from CourseTag
  opacity: 0.7;
  margin-left: 6px;
  cursor: pointer;
  font-size: 1.1rem; // Larger X
  padding: 0 3px;
  line-height: 1;
  
  &:hover {
    opacity: 1;
    color: ${colors.error};
  }
`;

const CourseInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 150px; // Increased min-width
  font-size: 0.95rem;
  padding: 4px; // Add some padding within the input field
  background-color: transparent;

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow buttons to wrap
  justify-content: space-between;
  gap: 10px; // Add gap for wrapped buttons
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 12px 20px;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-grow: 1; // Allow buttons to grow

  @media (min-width: 500px) {
    flex-grow: 0; // Don't grow on larger screens if space-between is enough
  }
  
  &:disabled {
    background-color: ${colors.disabledBg};
    color: ${colors.disabledColor};
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const SubmitButton = styled(Button)`
  background-color: ${colors.primary};
  color: ${colors.surface};
  
  &:hover:not(:disabled) {
    background-color: ${colors.primaryDark};
  }
`;

const ResetButton = styled(Button)`
  background-color: ${colors.surface};
  color: ${colors.textSecondary};
  border: 1px solid ${colors.border};
  
  &:hover:not(:disabled) {
    background-color: ${colors.disabledBg};
    border-color: ${colors.textSecondary};
  }
`;

const HelperText = styled.div`
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  margin-top: 6px;
`;

const ErrorText = styled.div`
  color: ${colors.error};
  font-size: 0.85rem;
  margin-top: 6px;
`;

const DropdownList = styled.ul`
  position: absolute;
  width: calc(100% - 2px); // Account for border
  max-height: 250px; // Slightly reduced max-height
  overflow-y: auto;
  margin: 2px 0 0 0; // Small top margin
  padding: 0;
  border: 1px solid ${colors.border};
  border-radius: 6px;
  background-color: ${colors.surface};
  box-shadow: 0 5px 10px rgba(0,0,0,0.1);
  z-index: 1000; // Ensure it's above other elements
  list-style: none;
`;

const DropdownItem = styled.li`
  padding: 10px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  border-bottom: 1px solid ${colors.border};

  &:last-child {
    border-bottom: none;
  }
  
  &:hover, &.highlighted {
    background-color: ${colors.primary};
    color: ${colors.surface};
    
    ${CourseBadge} { // Adjust badge color on hover/highlight for visibility
        background-color: ${colors.surface};
        color: ${colors.primary};
        border-color: ${colors.primary};
    }
    div[style*="color: #666"] { // Adjust subtitle color on hover
        color: ${colors.surface} !important;
        opacity: 0.8;
    }
  }
`;

const InstructorRowContainer = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow wrapping
  align-items: center;
  margin-bottom: 12px;
  gap: 10px;
`;

const InstructorLabel = styled.div`
  min-width: 80px; // Min-width for alignment
  font-size: 0.9rem;
  color: ${colors.text};
  font-weight: 500;
  padding-right: 5px;
  flex-shrink: 0;
`;

const InstructorInputContainer = styled.div`
  flex: 1;
  min-width: 200px; // Ensure select is not too small
  position: relative;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 20px;
  color: ${colors.textSecondary};
  font-style: italic;
  font-size: 0.95rem;
`;

const ErrorIndicator = styled.div`
  padding: 12px 15px;
  margin-bottom: 20px;
  color: ${colors.error};
  background-color: ${colors.errorLight};
  border: 1px solid ${colors.error};
  border-radius: 6px;
  font-size: 0.9rem;
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
    role="option"
    aria-selected={isHighlighted}
  >
    <CourseBadge course={course}>{/* Content handled by CourseBadge styles */}</CourseBadge>
    <div style={{ marginLeft: 10, flexGrow: 1 }}>
      <div style={{ fontWeight: 500 }}>{course}</div>
      {title && <div style={{ fontSize: '0.8rem', color: '#666' /* Original color, overridden by hover */ }}>{title}</div>}
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
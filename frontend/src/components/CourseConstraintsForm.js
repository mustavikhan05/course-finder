import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

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

// Autocomplete components
const AutocompleteContainer = styled.div`
  position: relative;
  width: 100%;
`;

const AutocompleteInput = styled.input`
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

const DEFAULT_CONSTRAINTS = {
  required_courses: ["BIO103", "CSE327", "CSE332", "EEE452", "ENG115", "CHE101L", "PHY108L"],
  start_time_constraint: "11:00 AM",
  day_pattern: ["ST", "MW"],
  exclude_evening_classes: true,
  max_days: 5,
  instructor_preferences: {}
};

const TIME_OPTIONS = [
  "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const DAY_PATTERNS = [
  { value: "ST", label: "Sunday-Tuesday (ST)" },
  { value: "MW", label: "Monday-Wednesday (MW)" },
  { value: "RA", label: "Thursday-Saturday (RA)" }
];

const DEFAULT_COURSE_LIST = [
  // Core courses mentioned in constraints
  "BIO103", "CSE327", "CSE332", "CSE332L", "EEE452", "ENG115", "CHE101L", "PHY108L",
  
  // Common CSE courses
  "CSE115", "CSE115L", "CSE173", "CSE215", "CSE215L", "CSE225", "CSE225L", "CSE231", 
  "CSE231L", "CSE299", "CSE299L", "CSE323", "CSE331", "CSE331L", "CSE338", "CSE373", 
  "CSE411", "CSE425", "CSE434", "CSE440", "CSE445", "CSE465", "CSE473", "CSE491",
  
  // Common EEE courses
  "EEE111", "EEE111L", "EEE141", "EEE142", "EEE154", "EEE201", "EEE203", "EEE205", 
  "EEE209", "EEE221", "EEE223", "EEE301", "EEE303", "EEE305", "EEE309", "EEE312", 
  "EEE321", "EEE405", "EEE409", "EEE412", "EEE415", "EEE419", "EEE421", "EEE451",
  
  // MAT courses
  "MAT116", "MAT120", "MAT125", "MAT130", "MAT250", "MAT350", "MAT361", "MAT370",
  
  // PHY courses
  "PHY107", "PHY107L", "PHY108", "PHY109", "PHY209", "PHY499",

  // BIO courses
  "BIO103L", "BIO104", "BIO104L", "BIO210", "BIO220", "BIO320", "BIO330",
  
  // CHE courses
  "CHE101", "CHE201", "CHE210",
  
  // Other common courses
  "ENG101", "ENG102", "ENG103", "ENG111", "ENV101", "ENV107"
];

// Create a mapping of courses to their likely instructors
// In a real implementation, this would be fetched from the API or a database
const COURSE_INSTRUCTOR_MAP = {
  "CSE327": ["NBM", "ARF", "TAN", "MZI"],
  "CSE332": ["MAQM", "MIB", "FAR", "TBA"],
  "CSE115": ["AKO", "RHK", "JBR", "TBA"],
  "CSE215": ["MKR", "NZM", "TBA"],
  "EEE452": ["SKB", "NMF", "TBA"],
  "ENG115": ["ShC", "TBA"],
  "BIO103": ["SUBK", "BAS", "TBA"],
  "PHY108L": ["HrR", "TBA"],
  "CHE101L": ["ADP", "TBA"]
};

// Default instructors to show when no mapping exists for a course
const DEFAULT_INSTRUCTORS = ["TBA", "NBM", "ARF", "ADP", "HrR", "ShC", "TAN", "MZI", "RAK", "SRH", "AHN", "MIB", "AKO"];

// Function to get instructor suggestions for a specific course
function getInstructorsForCourse(course) {
  // If we have specific instructors for this course, return them
  if (COURSE_INSTRUCTOR_MAP[course]) {
    return COURSE_INSTRUCTOR_MAP[course];
  }
  
  // Otherwise return default instructors
  return DEFAULT_INSTRUCTORS;
}

function AutocompleteDropdown({ 
  options, 
  value, 
  onChange, 
  placeholder, 
  filterPredicate = (option, input) => option.includes(input.toUpperCase())
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const containerRef = useRef(null);
  
  // Update filtered options whenever input changes
  useEffect(() => {
    if (inputValue.trim() === '') {
      setFilteredOptions(options.slice(0, 10)); // Show first 10 when empty
    } else {
      const filtered = options
        .filter(option => filterPredicate(option, inputValue))
        .slice(0, 10); // Limit to 10 results
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(0);
  }, [inputValue, options, filterPredicate]);
  
  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        (prev < filteredOptions.length - 1) ? prev + 1 : prev
      );
      setIsOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0) ? prev - 1 : 0);
    } else if (e.key === 'Enter' && isOpen) {
      e.preventDefault();
      if (filteredOptions[highlightedIndex]) {
        handleSelect(filteredOptions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
  };
  
  const handleSelect = (option) => {
    setInputValue(option);
    onChange(option);
    setIsOpen(false);
  };
  
  return (
    <AutocompleteContainer ref={containerRef}>
      <AutocompleteInput
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
      />
      {isOpen && filteredOptions.length > 0 && (
        <DropdownList>
          {filteredOptions.map((option, index) => (
            <DropdownItem
              key={option}
              className={index === highlightedIndex ? 'highlighted' : ''}
              onClick={() => handleSelect(option)}
            >
              {option}
            </DropdownItem>
          ))}
        </DropdownList>
      )}
    </AutocompleteContainer>
  );
}

// Course dropdown item component
const CourseDropdownItem = ({ course, onClick, isHighlighted }) => {
  return (
    <DropdownItem
      className={isHighlighted ? 'highlighted' : ''}
      onClick={onClick}
    >
      <CourseBadge course={course}>{getDepartment(course)}</CourseBadge>
      {course}
    </DropdownItem>
  );
};

function CourseConstraintsForm({ onSubmit, isLoading }) {
  // Try to load stored constraints from localStorage
  const [constraints, setConstraints] = useState(() => {
    const savedConstraints = localStorage.getItem('courseConstraints');
    return savedConstraints ? JSON.parse(savedConstraints) : DEFAULT_CONSTRAINTS;
  });
  
  const [courseInput, setCourseInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const courseDropdownRef = useRef(null);
  
  // Save constraints to localStorage whenever they change
  const saveConstraints = (newConstraints) => {
    localStorage.setItem('courseConstraints', JSON.stringify(newConstraints));
    setConstraints(newConstraints);
  };
  
  // Update filtered courses when input changes
  useEffect(() => {
    if (courseInput.trim() === '') {
      // Show more courses when empty (20 instead of 10)
      setFilteredCourses(DEFAULT_COURSE_LIST.slice(0, 20)); 
    } else {
      // More comprehensive filtering logic
      const input = courseInput.toUpperCase();
      const filtered = DEFAULT_COURSE_LIST
        .filter(course => {
          // Don't show courses already added
          if (constraints.required_courses.includes(course)) {
            return false;
          }
          
          // First priority: Courses that start with the input (exact prefix match)
          if (course.startsWith(input)) {
            return true;
          }
          
          // Second priority: Courses that contain the input
          if (course.includes(input)) {
            return true;
          }
          
          // For short inputs (3 chars or less), be more lenient
          if (input.length <= 3) {
            // Match department code like "CSE" or "EEE"
            const deptMatch = course.substring(0, 3) === input;
            return deptMatch;
          }
          
          return false;
        })
        // First show exact prefix matches, then others
        .sort((a, b) => {
          const aStartsWithInput = a.startsWith(input);
          const bStartsWithInput = b.startsWith(input);
          
          if (aStartsWithInput && !bStartsWithInput) return -1;
          if (!aStartsWithInput && bStartsWithInput) return 1;
          return 0;
        })
        .slice(0, 20); // Show more results (20 instead of 10)
      
      setFilteredCourses(filtered);
    }
  }, [courseInput, constraints.required_courses]);
  
  // Handle click outside to close course dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (courseDropdownRef.current && !courseDropdownRef.current.contains(event.target)) {
        setShowCourseDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleCourseSelect = (course) => {
    if (!constraints.required_courses.includes(course)) {
      const newCourses = [...constraints.required_courses, course];
      saveConstraints({ ...constraints, required_courses: newCourses });
    }
    
    setCourseInput('');
    setShowCourseDropdown(false);
  };
  
  const handleCourseInputChange = (e) => {
    setCourseInput(e.target.value.toUpperCase());
    setShowCourseDropdown(true);
  };
  
  const handleCourseInputKeyDown = (e) => {
    if (e.key === 'Enter' && courseInput.trim()) {
      e.preventDefault();
      
      if (filteredCourses.length > 0 && filteredCourses[0].startsWith(courseInput.trim())) {
        // Select first matching course
        handleCourseSelect(filteredCourses[0]);
      } else {
        // Add custom course
        handleCourseSelect(courseInput.trim());
      }
    }
  };
  
  const handleCourseRemove = (course) => {
    const newCourses = constraints.required_courses.filter(c => c !== course);
    
    // Also remove any instructor preferences for this course
    const newPreferences = { ...constraints.instructor_preferences };
    delete newPreferences[course];
    
    saveConstraints({ 
      ...constraints, 
      required_courses: newCourses,
      instructor_preferences: newPreferences
    });
  };
  
  const handleInputChange = (field, value) => {
    saveConstraints({ ...constraints, [field]: value });
  };
  
  const handleDayPatternChange = (pattern, isChecked) => {
    let newPatterns;
    
    if (isChecked) {
      newPatterns = [...constraints.day_pattern, pattern];
    } else {
      newPatterns = constraints.day_pattern.filter(p => p !== pattern);
    }
    
    saveConstraints({ ...constraints, day_pattern: newPatterns });
  };
  
  const handleInstructorPreferenceChange = (course, instructor) => {
    const newPreferences = { ...constraints.instructor_preferences };
    
    if (instructor.trim()) {
      newPreferences[course] = instructor.trim();
    } else {
      delete newPreferences[course];
    }
    
    saveConstraints({ ...constraints, instructor_preferences: newPreferences });
  };
  
  const resetForm = () => {
    saveConstraints(DEFAULT_CONSTRAINTS);
    setErrors({});
  };
  
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(constraints);
    }
  };
  
  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormTitle>Custom Schedule Constraints</FormTitle>
      
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
            />
            {showCourseDropdown && filteredCourses.length > 0 && (
              <DropdownList>
                {filteredCourses.map(course => (
                  <CourseDropdownItem
                    key={course}
                    course={course}
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
                <AutocompleteDropdown
                  options={getInstructorsForCourse(course)}
                  value={constraints.instructor_preferences[course] || ''}
                  onChange={(value) => handleInstructorPreferenceChange(course, value)}
                  placeholder="Enter instructor code (e.g., NBM)"
                />
              </InstructorInputContainer>
            </InstructorRowContainer>
          ))}
        </div>
        <HelperText>Enter instructor code for specific course requirements</HelperText>
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
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
  background-color: #e1f0fe;
  border: 1px solid #c1e0fe;
  border-radius: 4px;
  padding: 2px 8px;
  display: flex;
  align-items: center;
  font-size: 14px;
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
  max-height: 200px;
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
  "BIO103", "CSE327", "CSE332", "EEE452", "ENG115", "CHE101L", "PHY108L",
  "PHY107", "MAT116", "MAT125", "MAT130", "MAT250", "MAT350", "MAT361", "CSE115",
  "CSE215", "CSE173", "CSE225", "CSE231", "CSE299", "CSE323", "CSE331", "CSE338",
  "CSE373", "CSE425", "CSE473", "EEE141", "EEE111", "EEE154", "EEE201", "EEE312"
];

// Sample faculty list - in a real implementation, this would come from the API
const FACULTY_LIST = [
  "NBM", "TBA", "ARF", "ADP", "HrR", "ShC", "TAN", "MZI", "RAK", "SRH", "AHN", 
  "MIB", "AKO", "RHK", "JBR", "MKR", "NZM", "AST", "FAR", "MQU", "SKB", "NMF"
];

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
      setFilteredCourses(DEFAULT_COURSE_LIST.slice(0, 10)); // Show first 10 when empty
    } else {
      const filtered = DEFAULT_COURSE_LIST
        .filter(course => 
          course.includes(courseInput.toUpperCase()) && 
          !constraints.required_courses.includes(course)
        )
        .slice(0, 10); // Limit to 10 results
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
            <CourseTag key={course}>
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
                  <DropdownItem 
                    key={course} 
                    onClick={() => handleCourseSelect(course)}
                  >
                    {course}
                  </DropdownItem>
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
                  options={FACULTY_LIST}
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
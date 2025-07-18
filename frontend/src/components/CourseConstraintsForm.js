import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchAvailableCourses } from '../utils/api';

// Update colors to be more vibrant and modern
const colors = {
  primary: '#4361EE', // Vibrant blue
  primaryDark: '#3A56D4',
  primaryLight: '#D8E1FF',
  secondary: '#FF5E78', // Hot pink accent
  secondaryLight: '#FFD8DF',
  surface: '#ffffff',
  background: '#f8f9fa',
  text: '#2D3748', // Darker text for better contrast
  textSecondary: '#718096',
  border: '#E2E8F0',
  inputFocusBorder: '#4361EE',
  inputFocusShadow: 'rgba(67, 97, 238, 0.25)',
  error: '#FF5E78',
  errorLight: '#FFD8DF',
  success: '#38B2AC',
  disabledBg: '#EDF2F7',
  disabledColor: '#718096',
  // Department specific colors (more vibrant)
  cseBlue: '#4361EE', cseBlueLight: '#D8E1FF', cseBlueText: '#2A4287',
  eeeGreen: '#38B2AC', eeeGreenLight: '#D0F2F0', eeeGreenText: '#1F6D68',
  matPurple: '#805AD5', matPurpleLight: '#E9DEFF', matPurpleText: '#553C9A',
  bioOrange: '#ED8936', bioOrangeLight: '#FEEBC8', bioOrangeText: '#9C4221',
  phyRed: '#F56565', phyRedLight: '#FED7D7', phyRedText: '#C53030',
  cheIndigo: '#667EEA', cheIndigoLight: '#EBF4FF', cheIndigoText: '#434190',
  engTeal: '#319795', engTealLight: '#B2F5EA', engTealText: '#285E61',
  otherGray: '#718096', otherGrayLight: '#EDF2F7', otherGrayText: '#2D3748',
};

// First, define the getDepartmentColors function
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

// Then define CourseBadge
const CourseBadge = styled.span`
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: ${props => getDepartmentColors(props.course).text};
  background-color: ${props => getDepartmentColors(props.course).bg};
  border: 1px solid ${props => getDepartmentColors(props.course).border};
  line-height: 1.2;
`;

// Define CourseTag component
const CourseTag = styled.div`
  background-color: ${props => getDepartmentColors(props.course).bg};
  border: none;
  border-radius: 30px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: ${props => getDepartmentColors(props.course).text};
  font-weight: 600;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 7px rgba(0, 0, 0, 0.1);
  }
`;

// More modern card styling with subtle gradient and shadow
const FormContainer = styled.form`
  background: linear-gradient(135deg, ${colors.surface} 0%, ${colors.primaryLight} 100%);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 30px;
  box-shadow: 0 10px 25px rgba(67, 97, 238, 0.07), 0 5px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.primaryLight};

  @media (max-width: 767px) {
    padding: 22px;
    border-radius: 12px;
  }
`;

// More modern section titles
const FormTitle = styled.h3`
  font-size: 1.6rem;
  color: ${colors.primary};
  border-bottom: 2px solid ${colors.primaryLight};
  padding-bottom: 15px;
  margin-bottom: 28px;
  font-weight: 700;
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    padding-bottom: 12px;
    margin-bottom: 22px;
  }
`;

const FormSectionTitle = styled.h4`
  font-size: 1.2rem;
  color: ${colors.text};
  margin-top: 35px;
  margin-bottom: 18px;
  padding-bottom: 8px;
  border-bottom: 1px dashed ${colors.primaryLight};
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 50px;
    height: 3px;
    background-color: ${colors.primary};
    border-radius: 2px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr; // Single column on mobile
    gap: 15px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  // Add a subtle fade-in animation for form elements
  animation: fadeIn 0.4s ease-in-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }
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

// Add comment to disable the ESLint warning for Input
// eslint-disable-next-line no-unused-vars
const Input = styled.input`
  ${inputStyles}
  height: 44px; // Taller input for better touch targets
  
  @media (max-width: 480px) {
    height: 48px; // Even taller on very small screens
  }
`;

const Select = styled.select`
  ${inputStyles}
  height: 44px; // Taller select for better touch targets
  appearance: none; // Custom arrow will be needed or use a library
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${colors.textSecondary.substring(1)}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
  padding-right: 30px; // Make space for arrow
  cursor: pointer; // Indicate it's clickable
  
  &:hover {
    border-color: ${colors.primary};
  }
  
  @media (max-width: 480px) {
    height: 48px; // Even taller on very small screens
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const DayPatternLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  font-size: 0.95rem;
  color: ${colors.text};
  background-color: ${props => props.checked ? colors.primary + '15' : 'transparent'};
  border: 1px solid ${props => props.checked ? colors.primary : colors.border};
  border-radius: 8px;
  padding: 10px 15px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.checked ? colors.primary + '25' : colors.background};
    border-color: ${props => props.checked ? colors.primary : colors.primary + '50'};
  }
  
  @media (max-width: 480px) {
    width: 100%; // Full width on small screens
    padding: 12px 15px;
  }
`;

// Replace old toggle switch with improved version (no box-shadow on focus)
const ToggleSwitch = styled.div`
  position: relative;
  width: 48px;
  height: 24px;
  margin-right: 12px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
    
    &:checked + span {
      background-color: ${colors.primary};
    }
    
    &:checked + span:before {
      transform: translateX(24px);
    }
    
    &:focus-visible + span {
      outline: 2px solid ${colors.primaryDark};
      outline-offset: 2px;
    }
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${colors.disabledBg};
    transition: background-color 0.3s ease;
    border-radius: 34px;
    
    &:before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 2px;
      bottom: 2px;
      background-color: white;
      transition: transform 0.3s ease;
      border-radius: 50%;
    }
  }
  
  @media (max-width: 480px) {
    width: 52px; // Slightly larger on mobile
    height: 26px;
    
    span:before {
      height: 22px;
      width: 22px;
    }
    
    input:checked + span:before {
      transform: translateX(26px);
    }
  }
`;

const DayPatternCheckbox = ({ id, checked, onChange, children }) => (
  <DayPatternLabel htmlFor={id} checked={checked}>
    <ToggleSwitch>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
      />
      <span></span>
    </ToggleSwitch>
    {children}
  </DayPatternLabel>
);

// Update course tag input for a more modern look
const CoursesTagInput = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${colors.border};
  border-radius: 12px;
  background-color: ${colors.surface};
  min-height: 50px;
  align-items: center;
  cursor: text;
  transition: all 0.2s ease;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
  
  &:focus-within {
    outline: none;
    border-color: ${colors.primary};
    box-shadow: 0 0 0 3px ${colors.primaryLight};
  }
`;

// Nicer course input
const CourseInput = styled.input`
  border: none;
  outline: none;
  flex: 1;
  min-width: 200px;
  font-size: 0.95rem;
  padding: 8px 4px;
  background-color: transparent;
  color: ${colors.text};

  &::placeholder {
    color: ${colors.textSecondary};
    opacity: 0.8;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow buttons to wrap
  justify-content: space-between;
  gap: 15px; // Increased gap for better touch separation
  margin-top: 35px; // More space above buttons
  
  @media (max-width: 480px) {
    flex-direction: column; // Stack buttons on very small screens
  }
`;

const Button = styled.button`
  padding: 14px 24px; // Larger padding for better touch targets
  border-radius: 8px; // Slightly more rounded
  border: none;
  font-weight: 500;
  font-size: 1rem; // Slightly larger font
  cursor: pointer;
  transition: all 0.2s ease;
  
  @media (max-width: 480px) {
    width: 100%; // Full width on mobile
    padding: 16px 24px; // Even larger on mobile
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

// Enhance dropdown styling
const DropdownList = styled.ul`
  position: absolute;
  width: calc(100% - 2px);
  max-height: 300px;
  overflow-y: auto;
  margin: 5px 0 0 0;
  padding: 6px 0;
  border: none;
  border-radius: 12px;
  background-color: ${colors.surface};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 1500; // Higher z-index
  list-style: none;
  
  /* Custom scrollbar for better UX */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.primary};
    border-radius: 3px;
    opacity: 0.7;
  }
`;

// More colorful dropdown items
const DropdownItem = styled.li`
  padding: 12px 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  transition: all 0.2s ease;

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
        opacity: 0.9;
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

// Update the Checkbox styled component for evening classes toggle
const EveningClassesToggle = styled(ToggleSwitch)`
  // Any special styling for evening classes toggle
`;

// Create a styled label for the evening classes toggle
const EveningClassesLabel = styled(DayPatternLabel)`
  background-color: ${props => !props.checked ? colors.primary + '15' : 'transparent'};
  border: 1px solid ${props => !props.checked ? colors.primary : colors.border};
  
  &:hover {
    background-color: ${props => !props.checked ? colors.primary + '25' : colors.background};
    border-color: ${props => !props.checked ? colors.primary : colors.primary + '50'};
  }
`;

// Add a custom styled time selector component to replace the default dropdown
const TimeSelector = styled.div`
  position: relative;
  width: 100%;
`;

const TimeDisplay = styled.div`
  ${inputStyles}
  height: 44px;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding-right: 30px;
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23${colors.textSecondary.substring(1)}%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 10px;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${colors.primary};
    box-shadow: 0 0 0 1px ${colors.primaryLight};
  }
  
  @media (max-width: 480px) {
    height: 48px;
  }
`;

const TimeDropdown = styled.div`
  position: absolute;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${colors.surface};
  border: none;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  z-index: 1500;
  margin-top: 4px;
  
  /* Custom scrollbar for better UX */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.background};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.primary};
    border-radius: 3px;
  }
`;

const TimeOption = styled.div`
  padding: 12px 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${colors.primary};
    color: white;
  }
  
  ${props => props.selected && `
    background-color: ${colors.primary};
    color: white;
    font-weight: 500;
  `}
  
  &:not(:last-child) {
    border-bottom: 1px solid ${colors.border};
  }
`;

// A custom time selector component with update for global overlay
const CustomTimeSelector = ({ value, onChange, options, onOpenCallback, globalOverlayVisible }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (!showDropdown) {
      setTimeout(() => {
        setShowDropdown(true);
        if (onOpenCallback) onOpenCallback();
      }, 50);
    } else {
      setShowDropdown(false);
    }
  };
  
  // Handle option selection
  const handleSelect = (option) => {
    onChange(option);
    setShowDropdown(false);
  };
  
  // Close dropdown when global overlay is clicked
  useEffect(() => {
    if (!globalOverlayVisible && showDropdown) {
      setShowDropdown(false);
    }
  }, [globalOverlayVisible, showDropdown]);
  
  return (
    <TimeSelector ref={dropdownRef}>
      <TimeDisplay onClick={toggleDropdown}>
        {value}
      </TimeDisplay>
      
      {showDropdown && (
        <TimeDropdown>
          {options.map(option => (
            <TimeOption 
              key={option}
              selected={option === value}
              onClick={() => handleSelect(option)}
            >
              {option}
            </TimeOption>
          ))}
        </TimeDropdown>
      )}
    </TimeSelector>
  );
};

// Create a global overlay to catch first click outside dropdowns
const GlobalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background-color: transparent;
`;

// Add back the missing RemoveCourseBtn component
const RemoveCourseBtn = styled.button`
  background: none;
  border: none;
  color: currentColor; // Inherit color from CourseTag
  opacity: 0.7;
  margin-left: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  padding: 0 3px;
  line-height: 1;
  
  &:hover {
    opacity: 1;
    color: ${colors.error};
  }
`;

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
    return savedConstraints ? JSON.parse(savedConstraints) : {
      required_courses: [],
      start_time_constraint: "11:00 AM",
      day_pattern: ["ST", "MW"],
      exclude_evening_classes: true,
      max_days: 4,
      instructor_preferences: {}
    };
  });
  
  const [courseInput, setCourseInput] = useState('');
  const [errors, setErrors] = useState({});
  const [showCourseDropdown, setShowCourseDropdown] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const courseDropdownRef = useRef(null);
  const courseInputRef = useRef(null);
  
  // Get available courses from API data or use fallback
  const availableCourses = React.useMemo(() => {
    if (coursesData?.courses) {
      return Object.keys(coursesData.courses);
    }
    return [];
  }, [coursesData]);
  
  // Helper to get course title - wrap in useCallback
  const getCourseTitle = useCallback((course) => {
    if (coursesData?.courses?.[course]?.title) {
      return coursesData.courses[course].title;
    }
    return '';
  }, [coursesData]);
  
  // Helper to get instructors for a course - wrap in useCallback
  const getInstructorsForCourse = useCallback((course) => {
    if (coursesData?.courses?.[course]?.instructors) {
      return coursesData.courses[course].instructors;
    }
    return [];
  }, [coursesData]);
  
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
    saveConstraints({
      required_courses: [],
      start_time_constraint: "11:00 AM",
      day_pattern: ["ST", "MW"],
      exclude_evening_classes: true,
      max_days: 4,
      instructor_preferences: {}
    });
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

  // Function to focus the input when clicking anywhere in the tag container
  const handleContainerClick = () => {
    if (courseInputRef.current) {
      courseInputRef.current.focus();
    }
  };
  
  // Add state for global overlay
  const [showGlobalOverlay, setShowGlobalOverlay] = useState(false);
  
  // Update dropdown show logic to include overlay
  const handleDropdownShow = () => {
    // Small timeout to prevent immediate re-opening when closing another dropdown
    setTimeout(() => {
      setShowCourseDropdown(true);
      setShowGlobalOverlay(true);
    }, 50);
  };
  
  // Handle overlay click to close dropdowns
  const handleOverlayClick = () => {
    setShowCourseDropdown(false);
    setShowGlobalOverlay(false);
  };
  
  // Override the existing handleInputChange function to also handle overlay for custom dropdowns
  const handleTimeDropdownShow = () => {
    setShowGlobalOverlay(true);
  };

  return (
    <>
      {showGlobalOverlay && <GlobalOverlay onClick={handleOverlayClick} />}
      <FormContainer onSubmit={handleSubmit}>
        <FormTitle>Course Schedule Generator</FormTitle>
        
        {isLoadingCourses && (
          <LoadingIndicator>Loading available courses and instructors...</LoadingIndicator>
        )}
        
        {isCoursesError && (
          <ErrorIndicator>
            Error loading course data. Please try again later.
          </ErrorIndicator>
        )}
        
        <FormSectionTitle>Course Selection</FormSectionTitle>
        <FormGroup>
          <Label htmlFor="required_courses">Select Your Courses:</Label>
          <CoursesTagInput onClick={handleContainerClick}>
            {constraints.required_courses.map(course => (
              <CourseTag key={course} course={course}>
                {course}
                <RemoveCourseBtn 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering container click
                    handleCourseRemove(course);
                  }}
                  aria-label={`Remove ${course}`}
                >
                  ×
                </RemoveCourseBtn>
              </CourseTag>
            ))}
            <div ref={courseDropdownRef} style={{ flex: 1, position: 'relative' }}>
              <CourseInput
                ref={courseInputRef}
                id="course_input"
                value={courseInput}
                onChange={handleCourseInputChange}
                onKeyDown={handleCourseInputKeyDown}
                onFocus={handleDropdownShow}
                placeholder="Type course code..."
                autoComplete="off"
              />
              {showCourseDropdown && filteredCourses.length > 0 && (
                <DropdownList>
                  {filteredCourses.map(course => (
                    <DropdownItem
                      key={course}
                      onClick={() => handleCourseSelect(course)}
                    >
                      <CourseBadge course={course}>{course}</CourseBadge>
                      <div style={{ marginLeft: 8, color: '#666', fontSize: '0.85em' }}>{getCourseTitle(course)}</div>
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </div>
          </CoursesTagInput>
          <HelperText>Add all courses you want to take this semester</HelperText>
          {errors.required_courses && <ErrorText>{errors.required_courses}</ErrorText>}
        </FormGroup>
        
        <FormSectionTitle>Schedule Preferences</FormSectionTitle>
        <FormGrid>
          <FormGroup>
            <Label htmlFor="start_time">Earliest Class Start Time:</Label>
            <CustomTimeSelector
              value={constraints.start_time_constraint}
              onChange={(value) => handleInputChange('start_time_constraint', value)}
              options={TIME_OPTIONS}
              onOpenCallback={handleTimeDropdownShow}
              globalOverlayVisible={showGlobalOverlay}
            />
            <HelperText>Classes will not start before this time</HelperText>
          </FormGroup>
          
          <FormGroup>
            <Label>Maximum Days per Week:</Label>
            <CustomTimeSelector
              value={`${constraints.max_days} Days`}
              onChange={(value) => handleInputChange('max_days', parseInt(value.split(' ')[0]))}
              options={["2 Days", "3 Days", "4 Days", "5 Days", "6 Days"]}
              onOpenCallback={handleTimeDropdownShow}
              globalOverlayVisible={showGlobalOverlay}
            />
            <HelperText>Maximum number of different days you want to have classes</HelperText>
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <Label>Preferred Day Patterns:</Label>
          <CheckboxContainer>
            {DAY_PATTERNS.map(pattern => (
              <DayPatternCheckbox
                key={pattern.value}
                id={`pattern-${pattern.value}`}
                checked={constraints.day_pattern.includes(pattern.value)}
                onChange={(e) => handleDayPatternChange(pattern.value, e.target.checked)}
              >
                {pattern.label}
              </DayPatternCheckbox>
            ))}
          </CheckboxContainer>
          <HelperText>Select which day patterns you prefer for your classes</HelperText>
        </FormGroup>
        
        <FormGroup>
          <Label>Evening Classes:</Label>
          <EveningClassesLabel 
            htmlFor="evening-classes" 
            checked={constraints.exclude_evening_classes}
          >
            <EveningClassesToggle>
              <input
                id="evening-classes"
                type="checkbox"
                checked={!constraints.exclude_evening_classes}
                onChange={(e) => handleInputChange('exclude_evening_classes', !e.target.checked)}
              />
              <span></span>
            </EveningClassesToggle>
            Include classes starting at or after 6:00 PM
          </EveningClassesLabel>
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
            Reset Form
          </ResetButton>
          <SubmitButton type="submit" disabled={isLoading}>
            {isLoading ? 'Generating...' : 'Generate Schedules'}
          </SubmitButton>
        </ButtonGroup>
      </FormContainer>
    </>
  );
}

export default CourseConstraintsForm;
import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Assuming colors are accessible or redefined
const colors = {
  surface: '#ffffff',
  border: '#dee2e6',
  text: '#212529',
  textSecondary: '#6c757d',
  primary: '#007bff',
  warning: '#ffc107',
  warningLight: '#fff3cd',
  warningDark: '#b38600',
  danger: '#dc3545',
  dangerLight: '#f8d7da',
  accentPink: '#e91e63',
  lightGray: '#f8f9fa',
  mediumGray: '#e9ecef',
  tableHeaderBg: '#f1f3f5',
  tableEvenRowBg: '#f8f9fa',
};

const ScheduleCard = styled.div`
  background-color: ${props => props.isNew ? colors.warningLight : colors.surface};
  border: 1px solid ${props => props.isNew ? colors.warning : colors.border};
  border-radius: 12px; // More consistent with design system
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); // More subtle shadow
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 6px 18px rgba(0,0,0,0.12);
    transform: translateY(-2px);
  }
  
  @media (max-width: 768px) {
    border-radius: 10px; // Slightly smaller radius on mobile
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px; // Increased padding
  background-color: ${props => props.isNew ? colors.warningLight : colors.lightGray};
  border-bottom: 1px solid ${props => props.isNew ? colors.warning : colors.border};
  
  @media (max-width: 480px) {
    padding: 14px 16px; // Slightly reduced padding on smaller screens
  }
`;

const ScheduleTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${colors.text};
  font-weight: 600;
  display: flex;
  align-items: center;
  flex-wrap: wrap; // Allow wrapping on small screens
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
  }
`;

const ScoreBadge = styled.span`
  background-color: ${colors.primary};
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 12px;
  margin-left: 10px;
  
  @media (max-width: 480px) {
    margin-left: 8px;
    padding: 2px 6px;
  }
`;

const NewBadge = styled.span`
  background-color: ${colors.warning};
  color: ${colors.text}; // Darker text for better contrast on yellow
  font-size: 0.7rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 15px;
  margin-left: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 480px) {
    margin-left: 8px;
    padding: 2px 6px;
  }
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.active ? colors.accentPink : colors.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; // Center icon
  padding: 8px;
  border-radius: 50%; // Circular buttons
  transition: background-color 0.2s ease, color 0.2s ease;
  
  &:hover {
    background-color: ${colors.mediumGray};
    color: ${props => props.active ? colors.accentPink : colors.text};
  }
  
  svg {
    width: 22px; // Slightly larger icons
    height: 22px;
  }
`;

const ScheduleContent = styled.div`
  padding: ${props => props.isExpanded ? '20px' : '0'};
  max-height: ${props => props.isExpanded ? '1500px' : '0'}; // Increased max-height
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1); // More natural easing
  border-top: ${props => props.isExpanded ? `1px solid ${colors.border}` : 'none'};
  
  @media (max-width: 480px) {
    padding: ${props => props.isExpanded ? '16px 12px' : '0'};
  }
`;

const CourseTableWrapper = styled.div`
  overflow-x: auto; // Enable horizontal scrolling for mobile
  width: 100%;
  
  /* Add visual indicator for horizontal scroll */
  background-image: ${props => props.hasScroll ? 'linear-gradient(to right, transparent 70%, rgba(0,0,0,0.05))' : 'none'};
  background-size: 20px 100%;
  background-repeat: no-repeat;
  background-position: right center;
  
  /* Custom scrollbar for better UX */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${colors.lightGray};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.mediumGray};
    border-radius: 3px;
  }
  
  @media (max-width: 768px) {
    &::after {
      content: "→";
      position: absolute;
      right: 10px;
      bottom: 10px;
      color: ${colors.textSecondary};
      opacity: 0.5;
      font-size: 1.2rem;
      pointer-events: none;
      animation: fadeInOut 1.5s infinite alternate;
    }
    
    @keyframes fadeInOut {
      from { opacity: 0.2; }
      to { opacity: 0.7; }
    }
  }
`;

const CourseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  th, td {
    padding: 12px 10px; // Keep consistent padding
    text-align: left;
    vertical-align: middle;
  }
  
  @media (max-width: 768px) {
    font-size: 0.85rem; // Slightly smaller text on mobile
    
    th, td {
      padding: 10px 8px; // Slightly smaller padding on mobile
      white-space: nowrap; // Prevent text wrapping on mobile
    }
  }
`;

const TableHead = styled.thead`
  background-color: ${colors.tableHeaderBg};
  
  th {
    color: ${colors.textSecondary};
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid ${colors.border};
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid ${colors.border};
    &:last-child {
      border-bottom: none;
    }
  }

  tr:nth-child(even) {
    background-color: ${colors.tableEvenRowBg};
  }
  
  td {
    color: ${colors.text};
  }
`;

const SeatsCell = styled.td`
  font-weight: 500;
  color: ${props => {
    if (props.seats <= 0) return colors.danger; // No seats
    if (props.seats <= 3) return colors.warningDark; // Low seats (e.g. orange/dark yellow)
    if (props.seats <= 10) return colors.text; // Moderate seats
    return colors.success; // Plenty of seats (green)
  }};

  // Add a visual indicator for very low seats
  ${props => props.seats > 0 && props.seats <= 3 && `
    position: relative;
    &::before {
      content: '!';
      color: ${colors.warningDark};
      font-weight: bold;
      margin-right: 4px;
    }
  `}
  ${props => props.seats <= 0 && `
    text-decoration: line-through;
  `}
`;

const CourseCodeCell = styled.td`
  font-weight: 600;
  color: ${colors.primary};
  position: relative;
  
  /* Subtle department indicator based on course code */
  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: ${props => {
      const dept = (props.children || '').substring(0, 3);
      switch(dept) {
        case 'CSE': return '#007bff';
        case 'EEE': return '#28a745';
        case 'PHY': return '#dc3545';
        case 'CHE': return '#6610f2';
        case 'MAT': return '#6f42c1';
        case 'BIO': return '#fd7e14';
        case 'ENG': return '#20c997';
        default: return '#6c757d';
      }
    }};
  }
  
  padding-left: 15px; // Make space for the department indicator
`;

function Schedule({ schedule, index, isFavorite, onToggleFavorite }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const tableWrapperRef = useRef(null);
  
  // Check if table has horizontal scroll
  useEffect(() => {
    if (isExpanded && tableWrapperRef.current) {
      const { scrollWidth, clientWidth } = tableWrapperRef.current;
      setHasScroll(scrollWidth > clientWidth);
    }
  }, [isExpanded]);
  
  // Group courses by day
  const coursesByDay = {};
  schedule.courses.forEach(course => {
    course.days.split('').forEach(day => {
      if (!coursesByDay[day]) coursesByDay[day] = [];
      coursesByDay[day].push(course);
    });
  });
  
  return (
    <ScheduleCard isNew={schedule.is_new}>
      <ScheduleHeader isNew={schedule.is_new}>
        <ScheduleTitle>
          Schedule #{index + 1}
          {schedule.score !== undefined && (
            <ScoreBadge>Score: {schedule.score}</ScoreBadge>
          )}
          {schedule.is_new && <NewBadge>New</NewBadge>}
        </ScheduleTitle>
        
        <ScheduleActions>
          <ActionButton 
            active={isFavorite}
            onClick={() => onToggleFavorite(index)}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>
              </svg>
            )}
          </ActionButton>
          
          <ActionButton 
            onClick={() => setIsExpanded(!isExpanded)} 
            title={isExpanded ? "Collapse" : "Expand"}
            aria-label={isExpanded ? "Collapse" : "Expand"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
              </svg>
            )}
          </ActionButton>
        </ScheduleActions>
      </ScheduleHeader>
      
      <ScheduleContent isExpanded={isExpanded}>
        <CourseTableWrapper ref={tableWrapperRef} hasScroll={hasScroll}>
          <CourseTable>
            <TableHead>
              <tr>
                <th>Course</th>
                <th>Sec</th>
                <th>Days</th>
                <th>Time</th>
                <th>Room</th>
                <th>Instructor</th>
                <th>Seats</th>
              </tr>
            </TableHead>
            <TableBody>
              {schedule.courses.map((course, idx) => (
                <tr key={idx}>
                  <CourseCodeCell>{course.course_code}</CourseCodeCell>
                  <td>{course.section}</td>
                  <td>{course.days}</td>
                  <td>{course.start_time} - {course.end_time}</td>
                  <td>{course.room}</td>
                  <td>{course.instructor}</td>
                  <SeatsCell seats={parseInt(course.seats, 10)}>
                    {course.seats}
                  </SeatsCell>
                </tr>
              ))}
            </TableBody>
          </CourseTable>
        </CourseTableWrapper>
      </ScheduleContent>
    </ScheduleCard>
  );
}

export default Schedule; 
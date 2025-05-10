import React, { useState } from 'react';
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
  border-radius: 10px; // Slightly more pronounced radius
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0,0,0,0.07); // Softer, slightly larger shadow
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 18px;
  background-color: ${props => props.isNew ? colors.warningLight : colors.lightGray};
  border-bottom: 1px solid ${props => props.isNew ? colors.warning : colors.border};
`;

const ScheduleTitle = styled.h3`
  margin: 0;
  font-size: 1.2rem;
  color: ${colors.text};
  font-weight: 600;
  display: flex;
  align-items: center;
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
`;

const ScheduleScore = styled.div`
  font-size: 0.9rem;
  color: ${colors.textSecondary};
  padding: 0 18px 10px; // Add padding if shown outside content
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
  padding: ${props => props.isExpanded ? '18px' : '0 18px'}; // Consistent horizontal padding
  max-height: ${props => props.isExpanded ? '1200px' : '0'}; // Increased max-height
  overflow: ${props => props.isExpanded ? 'auto' : 'hidden'}; // Allow scroll if content too long
  transition: max-height 0.35s ease-in-out, padding 0.35s ease-in-out;
  border-top: ${props => props.isExpanded ? `1px solid ${colors.border}` : 'none'};
`;

const CourseTableWrapper = styled.div`
  overflow-x: auto; // Enable horizontal scrolling for the table on small screens
  width: 100%;
`;

const CourseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  
  th, td {
    padding: 12px 10px; // Adjusted padding
    text-align: left;
    vertical-align: middle;
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
`;

function Schedule({ schedule, index, isFavorite, onToggleFavorite }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
            <span style={{fontSize: '0.8rem', color: colors.textSecondary, marginLeft: '10px', fontWeight: 400}}>
              (Score: {schedule.score})
            </span>
          )}
          {schedule.is_new && <NewBadge>New</NewBadge>}
        </ScheduleTitle>
        
        <ScheduleActions>
          <ActionButton 
            active={isFavorite}
            onClick={() => onToggleFavorite(index)}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
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
          
          <ActionButton onClick={() => setIsExpanded(!isExpanded)} title="Expand/collapse">
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
        <CourseTableWrapper>
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
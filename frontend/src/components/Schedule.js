import React, { useState } from 'react';
import styled from 'styled-components';

const ScheduleCard = styled.div`
  background-color: ${props => props.isNew ? '#fffbf0' : '#fff'};
  border: 1px solid ${props => props.isNew ? '#ffcc80' : '#e0e0e0'};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ScheduleHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: ${props => props.isNew ? '#fff8e1' : '#f8f9fa'};
  border-bottom: 1px solid ${props => props.isNew ? '#ffe0b2' : '#e0e0e0'};
`;

const ScheduleTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #333;
  display: flex;
  align-items: center;
`;

const NewBadge = styled.span`
  background-color: #ff9800;
  color: white;
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 12px;
  margin-left: 10px;
  text-transform: uppercase;
`;

const ScheduleScore = styled.div`
  font-size: 0.9rem;
  color: #666;
`;

const ScheduleActions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${props => props.active ? '#e91e63' : '#757575'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f0f0f0;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const ScheduleContent = styled.div`
  padding: ${props => props.isExpanded ? '15px' : '0'};
  max-height: ${props => props.isExpanded ? '1000px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
`;

const CourseTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHead = styled.thead`
  background-color: #f0f0f0;
  
  th {
    padding: 10px;
    text-align: left;
    color: #555;
    font-weight: 600;
  }
`;

const TableBody = styled.tbody`
  tr:nth-child(even) {
    background-color: #f9f9f9;
  }
  
  td {
    padding: 10px;
    border-top: 1px solid #e0e0e0;
  }
`;

const SeatsCell = styled.td`
  color: ${props => {
    if (props.seats <= 3) return '#d32f2f';
    if (props.seats <= 5) return '#f57c00';
    return 'inherit';
  }};
  font-weight: ${props => props.seats <= 5 ? 'bold' : 'normal'};
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
        <CourseTable>
          <TableHead>
            <tr>
              <th>Course</th>
              <th>Section</th>
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
                <td>{course.course_code}</td>
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
        
        <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#666' }}>
          <div>Schedule Score: {schedule.score}</div>
        </div>
      </ScheduleContent>
    </ScheduleCard>
  );
}

export default Schedule; 
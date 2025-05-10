import React, { useState } from 'react';
import styled from 'styled-components';
import Schedule from './Schedule';

// Assuming colors are accessible or redefined
const colors = {
  primary: '#007bff',
  surface: '#ffffff',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  accentBlue: '#007bff', // Was #4a90e2
  accentOrange: '#fd7e14', // Was #e67e22
  lightGray: '#f8f9fa',
};

const Container = styled.div`
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow wrapping for smaller screens
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid ${colors.border};
`;

const Title = styled.h2`
  margin: 0 0 10px 0; // Add bottom margin for wrapped state
  color: ${colors.text};
  display: flex;
  align-items: center;
  font-size: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 0; // No bottom margin on larger screens
  }
`;

const ViewBadge = styled.span`
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  background-color: ${props => props.showingEveningClasses ? colors.accentBlue : colors.accentOrange};
  color: ${colors.surface};
  margin-left: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Count = styled.span`
  color: ${colors.textSecondary};
  font-size: 1rem;
  font-weight: 500;
`;

const EmptyMessage = styled.div`
  background-color: ${colors.surface};
  border: 1px dashed ${colors.border};
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  color: ${colors.textSecondary};
  font-size: 1.1rem;

  p {
      margin-top: 0;
      margin-bottom: 10px;
  }

  div[style*="italic"] {
      font-size: 0.9rem;
      color: ${colors.textSecondary};
  }
`;

const SchedulesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 25px; // Increased gap
`;

const FilterBar = styled.div`
  display: flex;
  flex-wrap: wrap; // Allow wrapping
  gap: 10px;
  margin-bottom: 20px;
`;

const FilterButton = styled.button`
  background-color: ${props => props.active ? colors.primary : colors.surface};
  color: ${props => props.active ? colors.surface : colors.primary};
  border: 1px solid ${props => props.active ? colors.primary : colors.border};
  border-radius: 20px; // Pill shape
  padding: 8px 18px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? colors.primaryDark : '#e9ecef' };
    border-color: ${props => props.active ? colors.primaryDark : colors.border };
    color: ${props => props.active ? colors.surface : colors.primaryDark};
  }

  @media (max-width: 767px) {
    padding: 6px 12px;
    font-size: 0.8rem;
  }
`;

function ScheduleList({ schedules, favorites, onToggleFavorite, showingEveningClasses }) {
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'new'
  
  if (!schedules || schedules.length === 0) {
    return (
      <Container>
        <Header>
          <Title>
            Available Schedules
            {/* The ViewBadge will be dynamic based on context, so we don't always show it if it is not relevant for current list (e.g. custom list) */}
            {typeof showingEveningClasses === 'boolean' && 
              <ViewBadge showingEveningClasses={showingEveningClasses}>
                {showingEveningClasses ? 'Incl. Evening' : 'Excl. Evening'}
              </ViewBadge>
            }
          </Title>
          <Count>0 found</Count>
        </Header>
        <EmptyMessage>
          <p>No valid schedules were found that meet the current criteria.</p>
          {typeof showingEveningClasses === 'boolean' && !showingEveningClasses && (
            <div style={{ marginTop: '10px', fontStyle: 'italic' }}>
              Try including evening classes or adjusting filters to see more options.
            </div>
          )}
        </EmptyMessage>
      </Container>
    );
  }
  
  // Ensure schedules is an array we can filter
  const schedulesArray = Array.isArray(schedules) ? schedules : [];
  
  // Filter schedules based on current filter
  const filteredSchedules = schedulesArray.filter((schedule, index) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return favorites.includes(index);
    if (filter === 'new') return schedule.is_new;
    return true;
  });
  
  return (
    <Container>
      <Header>
        <Title>
          Available Schedules
          {typeof showingEveningClasses === 'boolean' &&
            <ViewBadge showingEveningClasses={showingEveningClasses}>
              {showingEveningClasses ? 'Incl. Evening' : 'Excl. Evening'}
            </ViewBadge>
          }
        </Title>
        <Count>{schedulesArray.length} found</Count>
      </Header>
      
      <FilterBar>
        <FilterButton 
          active={filter === 'all'} 
          onClick={() => setFilter('all')}
        >
          All Schedules
        </FilterButton>
        <FilterButton 
          active={filter === 'favorites'} 
          onClick={() => setFilter('favorites')}
        >
          Favorites
          {filter === 'favorites' && " (♥)"}
        </FilterButton>
        <FilterButton 
          active={filter === 'new'} 
          onClick={() => setFilter('new')}
        >
          New Changes
          {filter === 'new' && " (New)"}
        </FilterButton>
      </FilterBar>
      
      {filteredSchedules.length === 0 ? (
        <EmptyMessage>
          <p>No schedules match the current filter.</p>
        </EmptyMessage>
      ) : (
        <SchedulesWrapper>
          {filteredSchedules.map((schedule, index) => (
            <Schedule 
              key={index}
              schedule={schedule}
              index={schedulesArray.indexOf(schedule)}
              isFavorite={favorites.includes(schedulesArray.indexOf(schedule))}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </SchedulesWrapper>
      )}
    </Container>
  );
}

export default ScheduleList; 
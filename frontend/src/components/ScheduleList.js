import React, { useState } from 'react';
import styled from 'styled-components';
import Schedule from './Schedule';

const Container = styled.div`
  margin-bottom: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h2`
  margin: 0;
  color: #333;
`;

const Count = styled.span`
  color: #666;
  font-size: 0.9rem;
`;

const EmptyMessage = styled.div`
  background-color: #f8f9fa;
  border-radius: 4px;
  padding: 40px;
  text-align: center;
  color: #666;
`;

const SchedulesWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
`;

const FilterButton = styled.button`
  background-color: ${props => props.active ? '#4a90e2' : '#f0f0f0'};
  color: ${props => props.active ? 'white' : '#333'};
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: ${props => props.active ? '#3a80d2' : '#e0e0e0'};
  }
`;

function ScheduleList({ schedules, favorites, onToggleFavorite }) {
  const [filter, setFilter] = useState('all'); // 'all', 'favorites', 'new'
  
  if (!schedules || schedules.length === 0) {
    return (
      <Container>
        <Header>
          <Title>Schedules</Title>
          <Count>No schedules found</Count>
        </Header>
        <EmptyMessage>
          No valid schedules were found that meet all constraints.
        </EmptyMessage>
      </Container>
    );
  }
  
  // Filter schedules based on current filter
  const filteredSchedules = schedules.filter((schedule, index) => {
    if (filter === 'all') return true;
    if (filter === 'favorites') return favorites.includes(index);
    if (filter === 'new') return schedule.is_new;
    return true;
  });
  
  return (
    <Container>
      <Header>
        <Title>Schedules</Title>
        <Count>{schedules.length} schedules found</Count>
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
        </FilterButton>
        <FilterButton 
          active={filter === 'new'} 
          onClick={() => setFilter('new')}
        >
          New Changes
        </FilterButton>
      </FilterBar>
      
      {filteredSchedules.length === 0 ? (
        <EmptyMessage>
          No schedules match the current filter.
        </EmptyMessage>
      ) : (
        <SchedulesWrapper>
          {filteredSchedules.map((schedule, index) => (
            <Schedule 
              key={index}
              schedule={schedule}
              index={schedules.indexOf(schedule)}
              isFavorite={favorites.includes(schedules.indexOf(schedule))}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </SchedulesWrapper>
      )}
    </Container>
  );
}

export default ScheduleList; 
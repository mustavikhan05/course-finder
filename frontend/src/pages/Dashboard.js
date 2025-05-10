import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import ScheduleList from '../components/ScheduleList';
import StatusPanel from '../components/StatusPanel';
import { fetchSchedules } from '../utils/api';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
  
  @media (min-width: 992px) {
    grid-template-columns: 3fr 1fr;
  }
`;

const MainContent = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
`;

const SidePanel = styled.div`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  padding: 20px;
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: #666;
`;

const ErrorMessage = styled.div`
  background-color: #fee;
  border: 1px solid #f99;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  color: #c00;
`;

const ToggleButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
`;

const ToggleButton = styled.button`
  padding: 10px 15px;
  border-radius: 4px;
  border: 1px solid #4a90e2;
  background-color: ${props => props.active ? '#4a90e2' : 'white'};
  color: ${props => props.active ? 'white' : '#4a90e2'};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? '#3a80d2' : '#f0f8ff'};
  }
`;

function Dashboard() {
  // State for favorite schedules
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteSchedules');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  });
  
  // State for evening class display toggle
  const [showEveningClasses, setShowEveningClasses] = useState(() => {
    const savedPreference = localStorage.getItem('showEveningClasses');
    return savedPreference ? JSON.parse(savedPreference) : true;
  });
  
  // Query for schedules data
  const { data, error, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Toggle a schedule as favorite
  const toggleFavorite = (scheduleIndex) => {
    setFavorites(prev => {
      const newFavorites = prev.includes(scheduleIndex)
        ? prev.filter(idx => idx !== scheduleIndex)
        : [...prev, scheduleIndex];
        
      localStorage.setItem('favoriteSchedules', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // Toggle showing evening classes
  const toggleEveningClasses = (value) => {
    setShowEveningClasses(value);
    localStorage.setItem('showEveningClasses', JSON.stringify(value));
  };

  // Get appropriate schedules based on current toggle state
  const getCurrentSchedules = () => {
    if (!data || !data.schedules) return [];
    return showEveningClasses ? data.schedules.with_evening : data.schedules.without_evening;
  };

  // Get total found count based on toggle state
  const getTotalFound = () => {
    if (!data || !data.total_found) return 0;
    return showEveningClasses 
      ? data.total_found.with_evening 
      : data.total_found.without_evening;
  };

  return (
    <DashboardContainer>
      <MainContent>
        {isLoading ? (
          <LoadingMessage>Loading schedules...</LoadingMessage>
        ) : isError ? (
          <ErrorMessage>
            Error loading schedules: {error.message}
          </ErrorMessage>
        ) : (
          <>
            <ToggleButtonGroup>
              <ToggleButton 
                active={showEveningClasses} 
                onClick={() => toggleEveningClasses(true)}
              >
                Include Evening Classes (6:00 PM+)
              </ToggleButton>
              <ToggleButton 
                active={!showEveningClasses} 
                onClick={() => toggleEveningClasses(false)}
              >
                Exclude Evening Classes
              </ToggleButton>
            </ToggleButtonGroup>
            
            <ScheduleList 
              schedules={getCurrentSchedules()} 
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              showingEveningClasses={showEveningClasses}
            />
          </>
        )}
      </MainContent>
      <SidePanel>
        <StatusPanel 
          lastUpdated={dataUpdatedAt}
          totalSchedules={getTotalFound()}
          stats={data?.stats || {}}
          isLoading={isLoading}
          showingEveningClasses={showEveningClasses}
        />
      </SidePanel>
    </DashboardContainer>
  );
}

export default Dashboard; 
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

function Dashboard() {
  // State for favorite schedules
  const [favorites, setFavorites] = useState(() => {
    const savedFavorites = localStorage.getItem('favoriteSchedules');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
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
          <ScheduleList 
            schedules={data.schedules} 
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
      </MainContent>
      <SidePanel>
        <StatusPanel 
          lastUpdated={dataUpdatedAt}
          totalSchedules={data?.total_found || 0}
          stats={data?.stats || {}}
          isLoading={isLoading}
        />
      </SidePanel>
    </DashboardContainer>
  );
}

export default Dashboard; 
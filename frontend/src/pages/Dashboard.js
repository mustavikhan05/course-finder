import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import ScheduleList from '../components/ScheduleList';
import StatusPanel from '../components/StatusPanel';
import CourseConstraintsForm from '../components/CourseConstraintsForm';
import { fetchSchedules, generateSchedules } from '../utils/api';

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

const SuccessMessage = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #a5d6a7;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
  color: #2e7d32;
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

const ModeSwitchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ModeSwitch = styled.div`
  display: inline-flex;
  background-color: #f0f4f8;
  border-radius: 30px;
  padding: 5px;
  margin-bottom: 20px;
`;

const ModeButton = styled.button`
  padding: 8px 16px;
  border-radius: 25px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.active ? '#4a90e2' : 'transparent'};
  color: ${props => props.active ? 'white' : '#555'};

  &:hover {
    background-color: ${props => props.active ? '#3a80d2' : '#e7edf5'};
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
  
  // State to track which mode we're in: default or custom
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('schedulerMode');
    return savedMode || 'default';
  });
  
  // Custom schedules state
  const [customSchedulesData, setCustomSchedulesData] = useState(null);
  const [showCustomSuccess, setShowCustomSuccess] = useState(false);
  
  // Query for default schedules data
  const { 
    data: defaultData, 
    error: defaultError, 
    isLoading: isDefaultLoading, 
    isError: isDefaultError, 
    dataUpdatedAt 
  } = useQuery({
    queryKey: ['schedules'],
    queryFn: fetchSchedules,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: mode === 'default', // Only run query in default mode
  });

  // Mutation for generating custom schedules
  const { 
    mutate: generateCustomSchedules, 
    isLoading: isGenerating, 
    error: generateError 
  } = useMutation({
    mutationFn: generateSchedules,
    onSuccess: (data) => {
      setCustomSchedulesData(data);
      setShowCustomSuccess(true);
      setTimeout(() => setShowCustomSuccess(false), 5000);
    },
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

  // Switch between default and custom modes
  const switchMode = (newMode) => {
    setMode(newMode);
    localStorage.setItem('schedulerMode', newMode);
  };

  // Handle form submission for custom constraints
  const handleCustomConstraintsSubmit = (constraints) => {
    generateCustomSchedules(constraints);
  };

  // Get appropriate data based on current mode
  const getCurrentData = () => {
    return mode === 'default' ? defaultData : customSchedulesData;
  };

  // Get appropriate schedules based on current mode and toggle state
  const getCurrentSchedules = () => {
    const data = getCurrentData();
    if (!data || !data.schedules) return [];
    
    if (mode === 'default') {
      return showEveningClasses ? data.schedules.with_evening : data.schedules.without_evening;
    } else {
      return data.schedules;
    }
  };

  // Get total found count based on mode and toggle state
  const getTotalFound = () => {
    const data = getCurrentData();
    if (!data) return 0;
    
    if (mode === 'default') {
      return data.total_found ? (showEveningClasses 
        ? data.total_found.with_evening 
        : data.total_found.without_evening) : 0;
    } else {
      return data.total_found || 0;
    }
  };

  // Get the current error based on mode
  const getCurrentError = () => {
    return mode === 'default' ? defaultError : generateError;
  };

  // Check if there's any loading happening
  const isLoading = mode === 'default' ? isDefaultLoading : isGenerating;
  const isError = mode === 'default' ? isDefaultError : !!generateError;
  const error = getCurrentError();

  return (
    <>
      <ModeSwitchContainer>
        <ModeSwitch>
          <ModeButton 
            active={mode === 'default'} 
            onClick={() => switchMode('default')}
          >
            Default Courses
          </ModeButton>
          <ModeButton 
            active={mode === 'custom'} 
            onClick={() => switchMode('custom')}
          >
            Custom Constraints
          </ModeButton>
        </ModeSwitch>
      </ModeSwitchContainer>
      
      {mode === 'custom' && (
        <CourseConstraintsForm 
          onSubmit={handleCustomConstraintsSubmit} 
          isLoading={isGenerating}
        />
      )}
      
      {showCustomSuccess && (
        <SuccessMessage>
          Schedules generated successfully! Scroll down to see the results.
        </SuccessMessage>
      )}
      
      <DashboardContainer>
        <MainContent>
          {isLoading && !customSchedulesData ? (
            <LoadingMessage>
              {mode === 'default' ? 'Loading schedules...' : 'Generating schedules...'}
            </LoadingMessage>
          ) : isError && !customSchedulesData ? (
            <ErrorMessage>
              Error {mode === 'default' ? 'loading' : 'generating'} schedules: {error?.message}
            </ErrorMessage>
          ) : (
            <>
              {mode === 'default' && (
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
              )}
              
              {getCurrentData() ? (
                <ScheduleList 
                  schedules={getCurrentSchedules()} 
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  showingEveningClasses={showEveningClasses}
                />
              ) : mode === 'custom' ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p>Use the form above to generate schedules with custom constraints.</p>
                </div>
              ) : null}
            </>
          )}
        </MainContent>
        <SidePanel>
          <StatusPanel 
            lastUpdated={dataUpdatedAt}
            totalSchedules={getTotalFound()}
            stats={getCurrentData()?.stats || {}}
            isLoading={isLoading}
            showingEveningClasses={showEveningClasses}
            mode={mode}
          />
        </SidePanel>
      </DashboardContainer>
    </>
  );
}

export default Dashboard; 
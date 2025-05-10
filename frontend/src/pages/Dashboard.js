import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import ScheduleList from '../components/ScheduleList';
import StatusPanel from '../components/StatusPanel';
import CourseConstraintsForm from '../components/CourseConstraintsForm';
import { fetchSchedules, generateSchedules } from '../utils/api';

// Use colors from App.js or define a similar palette if not directly accessible
// For this example, I'll assume colors are accessible or redefined
const colors = {
  primary: '#007bff',
  primaryDark: '#0056b3',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#212529',
  textSecondary: '#6c757d',
  error: '#dc3545',
  success: '#28a745',
  border: '#dee2e6',
  errorLight: '#f8d7da',
  successLight: '#d4edda',
};

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr; // Mobile-first: single column
  gap: 25px; // Increased gap
  
  @media (min-width: 768px) { // Tablet and above
    grid-template-columns: 2fr 1fr; // Adjust ratio if needed
  }

  @media (min-width: 1024px) { // Desktop
    grid-template-columns: 3fr 1fr;
  }
`;

const MainContent = styled.div`
  background-color: ${colors.surface};
  border-radius: 12px; // Softer radius
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); // Softer shadow
  padding: 25px;

  @media (max-width: 767px) {
    padding: 20px;
  }
`;

const SidePanel = styled.aside` // Changed to aside for semantics
  background-color: ${colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 25px;
  position: sticky; // Make side panel sticky on larger screens
  top: 20px; // Adjust as needed based on header height
  height: fit-content; // Only take up necessary height

  @media (max-width: 767px) {
    position: static; // Not sticky on mobile
    padding: 20px;
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 250px; // Adjusted height
  font-size: 1.1rem; // Slightly smaller
  color: ${colors.textSecondary};
  text-align: center;
`;

const MessageCardBase = styled.div`
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border: 1px solid transparent;
  
  h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.1rem;
    font-weight: 600;
  }
  
  p {
    margin-bottom: 5px;
    font-size: 0.95rem;
  }
  
  .suggestion {
    margin-top: 15px;
    font-style: italic;
    font-size: 0.9rem;
    opacity: 0.9;
  }
`;

const ErrorMessage = styled(MessageCardBase)`
  background-color: ${colors.errorLight};
  border-color: ${colors.error};
  color: ${colors.error};

  h4 {
    color: ${colors.error};
  }
  
  p, .suggestion strong {
    color: #721c24; // Darker red for better contrast on light red background
  }
`;

const SuccessMessage = styled(MessageCardBase)`
  background-color: ${colors.successLight};
  border-color: ${colors.success};
  color: #155724; // Darker green for better contrast

  h4 {
    color: #155724;
  }
`;

const ToggleButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 25px;
  gap: 10px;
  flex-wrap: wrap; // Allow buttons to wrap on smaller screens
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  border-radius: 25px; // Pill shape
  border: 1px solid ${props => props.active ? colors.primary : colors.border};
  background-color: ${props => props.active ? colors.primary : colors.surface};
  color: ${props => props.active ? colors.surface : colors.primary};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.active ? colors.primaryDark : '#e9ecef'};
    border-color: ${props => props.active ? colors.primaryDark : colors.border};
    color: ${props => props.active ? colors.surface : colors.primaryDark};
  }

  @media (max-width: 767px) {
    padding: 8px 15px;
    font-size: 0.85rem;
  }
`;

const ModeSwitchContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 25px;
`;

const ModeSwitch = styled.div`
  display: inline-flex;
  background-color: #e9ecef; // Lighter background for the switch itself
  border-radius: 30px;
  padding: 5px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
`;

const ModeButton = styled.button`
  padding: 10px 20px;
  border-radius: 25px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  background-color: ${props => props.active ? colors.primary : 'transparent'};
  color: ${props => props.active ? colors.surface : colors.textSecondary};
  font-size: 0.9rem;
  letter-spacing: 0.5px;

  &:hover:not(:disabled) {
    background-color: ${props => props.active ? colors.primaryDark : '#dfe3e6'};
    color: ${props => props.active ? colors.surface : colors.text};
  }

  @media (max-width: 767px) {
    padding: 8px 15px;
    font-size: 0.85rem;
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
              <h4>Error {mode === 'default' ? 'loading' : 'generating'} schedules</h4>
              <p>{error?.message}</p>
              {error?.message?.includes('offline during nighttime') && (
                <p className="suggestion">
                  <strong>Note about Availability:</strong> NSU's course system is typically offline overnight 
                  (after 12 AM Bangladesh time). The scheduler will be fully functional during daytime hours.
                </p>
              )}
              {error?.message?.includes('timeout') && !error?.message?.includes('offline during nighttime') && (
                <p className="suggestion">
                  The university website appears to be slow or unavailable. 
                  Please try again later or switch to default schedules mode.
                </p>
              )}
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
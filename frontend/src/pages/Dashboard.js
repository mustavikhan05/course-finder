import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import ScheduleList from '../components/ScheduleList';
import StatusPanel from '../components/StatusPanel';
import CourseConstraintsForm from '../components/CourseConstraintsForm';
import { fetchSchedules, generateSchedules } from '../utils/api';
import api from '../utils/api';

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
  
  @media (min-width: 992px) { // Increased breakpoint for better mobile/tablet experience
    grid-template-columns: 3fr 1fr;
  }
`;

const MainContent = styled.div`
  background-color: ${colors.surface};
  border-radius: 12px; // Softer radius
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); // Softer shadow
  padding: 25px;
  order: 2; // Display after SidePanel on mobile

  @media (min-width: 992px) {
    order: 1; // Restore original order on larger screens
  }

  @media (max-width: 767px) {
    padding: 20px;
    border-radius: 10px; // Slightly smaller radius on mobile
  }
`;

const SidePanel = styled.aside` // Changed to aside for semantics
  background-color: ${colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  padding: 25px;
  position: static; // Start with static positioning
  order: 1; // Display before MainContent on mobile
  
  @media (min-width: 992px) {
    position: sticky; // Make side panel sticky on larger screens
    top: 20px; // Adjust as needed based on header height
    height: fit-content; // Only take up necessary height
    order: 2; // Restore original order on larger screens
  }

  @media (max-width: 767px) {
    padding: 20px;
    border-radius: 10px; // Slightly smaller radius on mobile
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px; // Reduced height for mobile
  font-size: 1.1rem; // Slightly smaller
  color: ${colors.textSecondary};
  text-align: center;
  
  @media (min-width: 768px) {
    min-height: 250px; // Original height on larger screens
  }
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

const LastUpdated = styled.div`
  margin-top: 20px;
  color: ${colors.textSecondary};
  font-size: 0.95rem;
  text-align: right;
`;

const FloatingControls = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  gap: 10px;
  
  @media (min-width: 992px) {
    display: none; // Hide on larger screens
  }
`;

const FloatingButton = styled.button`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${colors.primary};
  color: white;
  border: none;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
  
  svg {
    width: 24px;
    height: 24px;
  }
`;

function Dashboard() {
  // State for favorite schedules
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteSchedules');
    return saved ? JSON.parse(saved) : [];
  });

  // State for schedules
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCustomSuccess, setShowCustomSuccess] = useState(false);

  // Add state for mobile scrolling
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Handle custom constraints submission
  const handleCustomConstraintsSubmit = async (constraints) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await api.post('/schedules/generate', constraints);
      setSchedules(response.data.schedules);
      setLastUpdated(new Date());
      setShowCustomSuccess(true);
      setTimeout(() => setShowCustomSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate schedules');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (schedule) => {
    const newFavorites = favorites.includes(schedule.id)
      ? favorites.filter(id => id !== schedule.id)
      : [...favorites, schedule.id];
    setFavorites(newFavorites);
    localStorage.setItem('favoriteSchedules', JSON.stringify(newFavorites));
  };

  // Add scroll event listener to show/hide back to top button
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Function to scroll back to top
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <CourseConstraintsForm 
        onSubmit={handleCustomConstraintsSubmit} 
        isLoading={isGenerating}
      />
      
      {showCustomSuccess && (
        <SuccessMessage>
          Schedules generated successfully! Scroll down to see the results.
        </SuccessMessage>
      )}
      
      {error && (
        <ErrorMessage>
          {error}
        </ErrorMessage>
      )}
      
      <DashboardContainer>
        <MainContent>
          <ScheduleList
            schedules={schedules}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
          
          {lastUpdated && (
            <LastUpdated>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </LastUpdated>
          )}
        </MainContent>
        
        <SidePanel>
          <StatusPanel 
            lastUpdated={lastUpdated}
            totalSchedules={schedules.length}
            stats={schedules.length > 0 ? schedules[0].stats : {}}
            isLoading={isLoading || isGenerating}
            showingEveningClasses={true} // Adjust based on your state
            mode="custom"
          />
        </SidePanel>
      </DashboardContainer>
      
      {showBackToTop && (
        <FloatingControls>
          <FloatingButton onClick={scrollToTop} aria-label="Scroll to top">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          </FloatingButton>
        </FloatingControls>
      )}
    </>
  );
}

export default Dashboard; 
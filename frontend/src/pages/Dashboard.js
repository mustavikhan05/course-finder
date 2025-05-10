import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery, useMutation } from '@tanstack/react-query';
import ScheduleList from '../components/ScheduleList';
import StatusPanel from '../components/StatusPanel';
import CourseConstraintsForm from '../components/CourseConstraintsForm';
import { fetchSchedules, generateSchedules } from '../utils/api';
import api from '../utils/api';
import ScheduleCard from '../components/ScheduleCard';

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

const LastUpdated = styled.div`
  margin-top: 20px;
  color: ${colors.textSecondary};
  font-size: 0.95rem;
  text-align: right;
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
    </>
  );
}

export default Dashboard; 
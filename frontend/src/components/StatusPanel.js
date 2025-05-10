import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Update colors to match the new color scheme
const colors = {
  primary: '#4361EE',
  primaryLight: '#D8E1FF',
  surface: '#ffffff',
  text: '#2D3748',
  textSecondary: '#718096',
  border: '#E2E8F0',
  success: '#38B2AC',
  danger: '#FF5E78',
  infoLight: '#D8E1FF',
  infoText: '#2A4287',
};

// Simpler panel styling without header
const Panel = styled.div`
  background: linear-gradient(135deg, ${colors.surface} 0%, ${colors.primaryLight} 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(67, 97, 238, 0.07), 0 5px 10px rgba(0, 0, 0, 0.05);
  border: 1px solid ${colors.primaryLight};
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

// Simple title styling
const PanelTitle = styled.h3`
  font-size: 1.3rem;
  color: ${colors.primary};
  margin-top: 0;
  margin-bottom: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

// Simple stats container
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin-bottom: 20px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`;

// Individual stat item
const StatItem = styled.div`
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.7);
  padding: 12px;
  transition: transform 0.2s ease;
  border: 1px solid ${colors.border};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
`;

// Stat label
const StatLabel = styled.div`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
  font-weight: 500;
`;

// Stat value
const StatValue = styled.div`
  font-size: 1.2rem;
  color: ${colors.text};
  font-weight: 600;
`;

// Refresh countdown indicator
const RefreshIndicator = styled.div`
  font-size: 0.9rem;
  color: ${colors.textSecondary};
  text-align: center;
  margin-top: 15px;
  
  // Progress bar for countdown
  &::after {
    content: "";
    display: block;
    width: ${props => `${(props.countdown / 30) * 100}%`};
    height: 3px;
    background-color: ${colors.primary};
    margin: 8px auto 0;
    border-radius: 2px;
    transition: width 1s linear;
  }
`;

// Simplified StatusPanel component
function StatusPanel({ 
  lastUpdated, 
  totalSchedules,
  isLoading
}) {
  const [countdown, setCountdown] = useState(30);
  
  // Handle countdown timer
  useEffect(() => {
    if (lastUpdated) {
      setCountdown(30);
    }
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastUpdated]);
  
  // Format time
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Not yet updated';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  return (
    <Panel>
      <PanelTitle>
        Course Finder Stats
      </PanelTitle>
      
      <StatsContainer>
        <StatItem>
          <StatLabel>Schedules Found</StatLabel>
          <StatValue>{isLoading ? '...' : totalSchedules.toLocaleString()}</StatValue>
        </StatItem>
        
        <StatItem>
          <StatLabel>Last Update</StatLabel>
          <StatValue>{formatTime(lastUpdated)}</StatValue>
        </StatItem>
      </StatsContainer>
      
      {!isLoading && (
        <RefreshIndicator countdown={countdown}>
          Refreshing in {countdown} seconds
        </RefreshIndicator>
      )}
    </Panel>
  );
}

export default StatusPanel; 
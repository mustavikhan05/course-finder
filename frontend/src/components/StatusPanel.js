import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
`;

const PanelTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.2rem;
`;

const StatusItem = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 4px;
`;

const Value = styled.div`
  font-size: 1.1rem;
  color: #333;
  font-weight: ${props => props.bold ? '600' : 'normal'};
`;

const RefreshCountdown = styled.div`
  font-size: 0.85rem;
  color: #888;
  margin-top: 15px;
  text-align: center;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  background-color: ${props => props.showingEveningClasses ? '#4a90e2' : '#e67e22'};
  color: white;
  margin-left: 8px;
`;

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

function StatusPanel({ lastUpdated, totalSchedules, stats, isLoading, showingEveningClasses }) {
  const [countdown, setCountdown] = useState(30);
  
  // Update countdown timer
  useEffect(() => {
    if (isLoading) return;
    
    setCountdown(30);
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastUpdated, isLoading]);
  
  // Get the appropriate courses after filtering count
  const getFilteredCoursesCount = () => {
    if (!stats.courses_after_filtering) return 0;
    
    // Check if courses_after_filtering is an object with both types
    if (typeof stats.courses_after_filtering === 'object') {
      return showingEveningClasses 
        ? stats.courses_after_filtering.with_evening || 0
        : stats.courses_after_filtering.without_evening || 0; 
    }
    
    // Fallback to direct value if it's not structured
    return stats.courses_after_filtering;
  };
  
  return (
    <Panel>
      <PanelTitle>
        System Status
        <Badge showingEveningClasses={showingEveningClasses}>
          {showingEveningClasses ? 'With Evening' : 'No Evening'}
        </Badge>
      </PanelTitle>
      
      <StatusItem>
        <Label>Last Updated</Label>
        <Value>{formatTimestamp(lastUpdated)}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Total Schedules Found</Label>
        <Value bold>{totalSchedules}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Courses Fetched</Label>
        <Value>{stats.courses_fetched || 0}</Value>
      </StatusItem>
      
      <StatusItem>
        <Label>Courses After Filtering</Label>
        <Value>{getFilteredCoursesCount()}</Value>
      </StatusItem>
      
      <RefreshCountdown>
        {isLoading ? 'Refreshing...' : `Refreshing in ${countdown} seconds`}
      </RefreshCountdown>
    </Panel>
  );
}

export default StatusPanel; 
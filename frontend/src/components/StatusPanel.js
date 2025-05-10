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

const formatTimestamp = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

function StatusPanel({ lastUpdated, totalSchedules, stats, isLoading }) {
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
  
  return (
    <Panel>
      <PanelTitle>System Status</PanelTitle>
      
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
        <Value>{stats.courses_after_filtering || 0}</Value>
      </StatusItem>
      
      <RefreshCountdown>
        {isLoading ? 'Refreshing...' : `Refreshing in ${countdown} seconds`}
      </RefreshCountdown>
    </Panel>
  );
}

export default StatusPanel; 
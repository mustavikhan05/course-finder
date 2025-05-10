import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Panel = styled.div`
  background-color: #f5f8fa;
  border-radius: 6px;
  overflow: hidden;
`;

const PanelHeader = styled.div`
  background-color: #4a90e2;
  color: white;
  padding: 12px 15px;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.online ? '#4caf50' : '#f44336'};
  margin-right: 6px;
`;

const PanelBody = styled.div`
  padding: 15px;
`;

const StatusItem = styled.div`
  margin-bottom: 12px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const StatusLabel = styled.div`
  font-size: 12px;
  color: #888;
  margin-bottom: 3px;
`;

const StatusValue = styled.div`
  font-size: 14px;
  color: #333;
  font-weight: 500;
`;

const RefreshCountdown = styled.div`
  font-size: 12px;
  color: #888;
  margin-top: 15px;
  text-align: center;
  font-style: italic;
`;

const ConstraintsList = styled.ul`
  margin: 0;
  padding-left: 18px;
  font-size: 13px;
  color: #555;
`;

const ConstraintItem = styled.li`
  margin-bottom: 4px;
`;

const InfoNote = styled.div`
  margin-top: 15px;
  padding: 10px;
  background-color: #e1f5fe;
  border-left: 3px solid #29b6f6;
  border-radius: 2px;
  font-size: 12px;
  color: #0277bd;
`;

function StatusPanel({ 
  lastUpdated, 
  totalSchedules, 
  stats, 
  isLoading, 
  showingEveningClasses,
  mode = 'default'
}) {
  const [countdown, setCountdown] = useState(30);
  
  useEffect(() => {
    // Reset countdown when data is updated
    if (lastUpdated) {
      setCountdown(30);
    }
    
    // Only start countdown if in default mode
    if (mode !== 'default') return;
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) return 30;
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [lastUpdated, mode]);
  
  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  
  // Check if current time is between midnight and 8 AM Bangladesh time (UTC+6)
  const isNighttime = () => {
    const now = new Date();
    const bdTime = new Date(now.getTime() + (6 * 60 * 60 * 1000)); // Convert to Bangladesh time
    const hour = bdTime.getUTCHours();
    return hour >= 0 && hour < 8; // Between midnight and 8 AM
  };
  
  return (
    <Panel>
      <PanelHeader>
        <span>System Status</span>
        <StatusIndicator online={!isLoading} />
      </PanelHeader>
      <PanelBody>
        <StatusItem>
          <StatusLabel>Mode</StatusLabel>
          <StatusValue>{mode === 'default' ? 'Default Courses' : 'Custom Constraints'}</StatusValue>
        </StatusItem>
        
        {mode === 'default' && (
          <StatusItem>
            <StatusLabel>Last Updated</StatusLabel>
            <StatusValue>{formatTime(lastUpdated)}</StatusValue>
          </StatusItem>
        )}
        
        <StatusItem>
          <StatusLabel>Valid Schedules Found</StatusLabel>
          <StatusValue>
            {isLoading ? 'Calculating...' : totalSchedules.toLocaleString()}
          </StatusValue>
        </StatusItem>
        
        {mode === 'default' && stats.courses_fetched && (
          <>
            <StatusItem>
              <StatusLabel>Total Course Sections</StatusLabel>
              <StatusValue>{stats.courses_fetched.toLocaleString()}</StatusValue>
            </StatusItem>
            
            <StatusItem>
              <StatusLabel>Filtered Sections</StatusLabel>
              <StatusValue>
                {stats.courses_after_filtering && (
                  showingEveningClasses 
                    ? stats.courses_after_filtering.with_evening.toLocaleString()
                    : stats.courses_after_filtering.without_evening.toLocaleString()
                )}
              </StatusValue>
            </StatusItem>
          </>
        )}
        
        {mode === 'custom' && stats.courses_fetched && (
          <>
            <StatusItem>
              <StatusLabel>Total Course Sections</StatusLabel>
              <StatusValue>{stats.courses_fetched.toLocaleString()}</StatusValue>
            </StatusItem>
            
            <StatusItem>
              <StatusLabel>Filtered Sections</StatusLabel>
              <StatusValue>
                {stats.courses_after_filtering && stats.courses_after_filtering.toLocaleString()}
              </StatusValue>
            </StatusItem>
            
            {stats.constraints && (
              <StatusItem>
                <StatusLabel>Applied Constraints</StatusLabel>
                <ConstraintsList>
                  <ConstraintItem>
                    {stats.constraints.required_courses.length} required courses
                  </ConstraintItem>
                  <ConstraintItem>
                    Start time ≥ {stats.constraints.start_time_constraint}
                  </ConstraintItem>
                  <ConstraintItem>
                    Day patterns: {stats.constraints.day_pattern.join(', ')}
                  </ConstraintItem>
                  <ConstraintItem>
                    Max {stats.constraints.max_days} days per week
                  </ConstraintItem>
                  <ConstraintItem>
                    {stats.constraints.exclude_evening_classes ? 'Excluding' : 'Including'} evening classes
                  </ConstraintItem>
                  {Object.keys(stats.constraints.instructor_preferences).length > 0 && (
                    <ConstraintItem>
                      {Object.keys(stats.constraints.instructor_preferences).length} instructor preferences
                    </ConstraintItem>
                  )}
                </ConstraintsList>
              </StatusItem>
            )}
          </>
        )}
        
        {mode === 'default' && !isLoading && (
          <RefreshCountdown>
            Refreshing in {countdown} seconds...
          </RefreshCountdown>
        )}
        
        {isNighttime() && (
          <InfoNote>
            <strong>Note:</strong> NSU's course system is typically offline during nighttime hours 
            (after 12 AM Bangladesh time). The scheduler will be fully functional during daytime hours.
          </InfoNote>
        )}
      </PanelBody>
    </Panel>
  );
}

export default StatusPanel; 
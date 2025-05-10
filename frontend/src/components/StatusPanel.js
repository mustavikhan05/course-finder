import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Assuming colors are accessible or redefined
const colors = {
  primary: '#007bff',
  surface: '#ffffff',
  text: '#212529',
  textSecondary: '#6c757d',
  border: '#dee2e6',
  success: '#28a745',
  danger: '#dc3545',
  infoLight: '#cfe2ff', // Lighter blue for info notes
  infoText: '#004085',
  infoBorder: '#b8daff',
  panelHeaderBg: '#343a40', // Darker header for contrast
  panelHeaderColor: '#ffffff',
};

const Panel = styled.div`
  background-color: ${colors.surface}; // Changed from #f5f8fa
  border-radius: 12px; // Consistent with other cards
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08); // Consistent shadow
`;

const PanelHeader = styled.div`
  background-color: ${colors.panelHeaderBg};
  color: ${colors.panelHeaderColor};
  padding: 12px 18px;
  font-weight: 600; // Bolder header text
  font-size: 1.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 12px; // Slightly larger
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.online ? colors.success : colors.danger};
  margin-left: 8px; // Adjusted margin
  border: 2px solid ${colors.panelHeaderBg}; // Creates a border effect
  box-shadow: 0 0 5px ${props => props.online ? colors.success : colors.danger}33; // Subtle glow
`;

const PanelBody = styled.div`
  padding: 18px;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); // Responsive grid
  gap: 15px;
  margin-bottom: 18px;
`;

const StatusItem = styled.div`
  background-color: ${colors.background}; // Light background for each item
  padding: 12px;
  border-radius: 6px;
  border: 1px solid ${colors.border};
`;

const StatusLabel = styled.div`
  font-size: 0.8rem;
  color: ${colors.textSecondary};
  margin-bottom: 4px;
  text-transform: uppercase;
  font-weight: 500;
`;

const StatusValue = styled.div`
  font-size: 1.1rem; // Larger value text
  color: ${colors.text};
  font-weight: 600;
  word-break: break-word;
`;

const RefreshCountdown = styled.div`
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  margin-top: 20px;
  text-align: center;
  font-style: italic;
`;

const ConstraintsList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 18px;
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  list-style-type: disc; // More standard list style
`;

const ConstraintItem = styled.li`
  margin-bottom: 5px;
  line-height: 1.5;
`;

const InfoNote = styled.div`
  margin-top: 20px;
  padding: 12px 15px;
  background-color: ${colors.infoLight};
  border-left: 4px solid ${colors.primary}; // Use primary color for border
  border-radius: 6px;
  font-size: 0.85rem;
  color: ${colors.infoText};

  strong {
    color: ${colors.primary};
    font-weight: 600;
  }
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
        <StatusIndicator online={!isLoading && !isNighttime()} />
      </PanelHeader>
      <PanelBody>
        <StatusGrid>
          <StatusItem>
            <StatusLabel>Mode</StatusLabel>
            <StatusValue>{mode === 'default' ? 'Default View' : 'Custom Build'}</StatusValue>
          </StatusItem>
          
          {mode === 'default' && (
            <StatusItem>
              <StatusLabel>Last Update</StatusLabel>
              <StatusValue>{formatTime(lastUpdated)}</StatusValue>
            </StatusItem>
          )}
          
          <StatusItem>
            <StatusLabel>Schedules Found</StatusLabel>
            <StatusValue>
              {isLoading ? '...' : totalSchedules.toLocaleString()}
            </StatusValue>
          </StatusItem>
          
          {mode === 'default' && stats.courses_fetched && (
            <>
              <StatusItem>
                <StatusLabel>Total Sections</StatusLabel>
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
          
          {mode === 'custom' && stats.courses_fetched != null && (
            <>
              <StatusItem>
                <StatusLabel>Original Sections</StatusLabel>
                <StatusValue>{stats.courses_fetched.toLocaleString()}</StatusValue>
              </StatusItem>
              
              <StatusItem>
                <StatusLabel>Matching Sections</StatusLabel>
                <StatusValue>
                  {stats.courses_after_filtering != null ? stats.courses_after_filtering.toLocaleString() : 'N/A'}
                </StatusValue>
              </StatusItem>
            </>
          )}
        </StatusGrid>
        
        {mode === 'custom' && stats.constraints && (
          <StatusItem style={{ gridColumn: '1 / -1' }}> {/* Make constraints section full width */}
            <StatusLabel>Active Constraints</StatusLabel>
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
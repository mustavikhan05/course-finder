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
  
  @media (max-width: 768px) {
    border-radius: 10px; // Slightly smaller radius on mobile
  }
`;

const PanelHeader = styled.div`
  background-color: ${colors.panelHeaderBg};
  color: ${colors.panelHeaderColor};
  padding: 14px 18px; // Increased padding
  font-weight: 600; // Bolder header text
  font-size: 1.05rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 480px) {
    padding: 12px 16px; // Slightly reduced padding on smaller screens
    font-size: 1rem;
  }
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
  
  // Add a pulsing animation for the status indicator
  animation: ${props => props.online ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% {
      box-shadow: 0 0 0 0 ${props => props.online ? `${colors.success}80` : 'none'};
    }
    70% {
      box-shadow: 0 0 0 6px ${props => props.online ? `${colors.success}00` : 'none'};
    }
    100% {
      box-shadow: 0 0 0 0 ${props => props.online ? `${colors.success}00` : 'none'};
    }
  }
`;

const PanelBody = styled.div`
  padding: 20px;
  
  @media (max-width: 480px) {
    padding: 16px 14px; // Reduced padding on mobile
  }
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); // Responsive grid
  gap: 15px;
  margin-bottom: 18px;
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr); // Force 2 columns on very small screens
    gap: 10px;
  }
`;

const StatusItem = styled.div`
  background-color: ${colors.background}; // Light background for each item
  padding: 12px;
  border-radius: 8px; // More consistent with design system
  border: 1px solid ${colors.border};
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
  }
  
  @media (max-width: 480px) {
    padding: 10px; // Smaller padding on mobile
  }
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
  
  @media (max-width: 480px) {
    font-size: 1rem; // Slightly smaller on mobile
  }
`;

const RefreshCountdown = styled.div`
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  margin-top: 20px;
  text-align: center;
  font-style: italic;
  
  // Add a visual progress indicator
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

const ConstraintsList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 18px;
  font-size: 0.85rem;
  color: ${colors.textSecondary};
  list-style-type: disc; // More standard list style
  
  @media (max-width: 480px) {
    padding-left: 16px;
    font-size: 0.8rem;
  }
`;

const ConstraintItem = styled.li`
  margin-bottom: 6px;
  line-height: 1.5;
`;

const InfoNote = styled.div`
  margin-top: 20px;
  padding: 14px 16px;
  background-color: ${colors.infoLight};
  border-left: 4px solid ${colors.primary}; // Use primary color for border
  border-radius: 8px;
  font-size: 0.85rem;
  color: ${colors.infoText};
  animation: fadeIn 0.5s ease-in;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  strong {
    color: ${colors.primary};
    font-weight: 600;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
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
          <RefreshCountdown countdown={countdown}>
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
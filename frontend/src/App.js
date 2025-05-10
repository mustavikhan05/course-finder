import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Dashboard from './pages/Dashboard';

// Define a modern color palette
const colors = {
  primary: '#007bff', // A vibrant blue
  primaryDark: '#0056b3',
  secondary: '#6c757d', // A muted gray for secondary text/elements
  background: '#f8f9fa', // Light gray background for the app
  surface: '#ffffff', // White for card backgrounds, inputs, etc.
  text: '#212529', // Dark gray for primary text
  textSecondary: '#6c757d',
  error: '#dc3545',
  success: '#28a745',
  warning: '#ffc107',
  border: '#dee2e6',
};

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: ${colors.background};
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: ${colors.text};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    touch-action: manipulation; /* Improves touch behavior */
    overflow-x: hidden;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* Improved touch targets for mobile */
  button, 
  input, 
  select, 
  a {
    touch-action: manipulation;
  }

  /* Standardize form element sizes */
  input, 
  select, 
  button,
  textarea {
    font-family: inherit;
    font-size: 16px; /* Prevents iOS zoom on focus */
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 0;
    font-weight: 600; // Slightly bolder headings
  }
  
  /* Prevent overflows */
  img, video {
    max-width: 100%;
    height: auto;
  }
`;

const AppContainer = styled.div`
  max-width: 1300px; // Slightly wider max-width
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 15px; // Less padding on mobile
  }
`;

const Header = styled.header`
  margin-bottom: 40px; // Increased spacing
  padding-bottom: 20px;
  border-bottom: 1px solid ${colors.border};
  text-align: center;
`;

const Title = styled.h1`
  color: ${colors.primary};
  font-size: 2.5rem; // Larger title
  font-weight: 700;
  margin-bottom: 8px;

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.h2`
  color: ${colors.textSecondary};
  font-size: 1.1rem; // Adjusted size
  font-weight: 400; // Lighter subtitle
`;

function App() {
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Header>
          <Title>NSU Course Scheduler</Title>
          <Subtitle>Find your ideal course schedule with ease</Subtitle>
        </Header>
        <main>
          <Dashboard />
        </main>
      </AppContainer>
    </>
  );
}

export default App;
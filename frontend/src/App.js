import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Dashboard from './pages/Dashboard';

// Define a modern color palette matching the CourseConstraintsForm
const colors = {
  primary: '#4361EE', // Vibrant blue
  primaryDark: '#3A56D4',
  primaryLight: '#D8E1FF',
  secondary: '#FF5E78', // Hot pink accent
  secondaryLight: '#FFD8DF',
  surface: '#ffffff',
  background: '#f8f9fa',
  text: '#2D3748', // Darker text for better contrast
  textSecondary: '#718096',
  border: '#E2E8F0',
  error: '#FF5E78',
  success: '#38B2AC',
  warning: '#F6AD55',
  border: '#E2E8F0',
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
    font-weight: 600;
    color: ${colors.text};
  }
  
  /* Prevent overflows */
  img, video {
    max-width: 100%;
    height: auto;
  }
  
  /* Add smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Add custom selection styling */
  ::selection {
    background-color: ${colors.primaryLight};
    color: ${colors.primaryDark};
  }
`;

const AppContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 25px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 15px;
  }
`;

const Header = styled.header`
  margin-bottom: 40px;
  padding-bottom: 25px;
  border-bottom: 2px solid ${colors.primaryLight};
  text-align: center;
  position: relative;
  
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    bottom: -2px;
    width: 100px;
    height: 4px;
    background-color: ${colors.primary};
    transform: translateX(-50%);
    border-radius: 2px;
  }
`;

const Title = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 10px;
  background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-fill-color: transparent;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const Subtitle = styled.h2`
  color: ${colors.textSecondary};
  font-size: 1.2rem;
  font-weight: 400;
  margin-top: 0;
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
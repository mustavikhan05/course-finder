import React from 'react';
import styled from 'styled-components';
import Dashboard from './pages/Dashboard';

const AppContainer = styled.div`
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  margin-bottom: 30px;
`;

const Title = styled.h1`
  color: #333;
  text-align: center;
`;

const Subtitle = styled.h2`
  color: #666;
  font-size: 1.2rem;
  font-weight: normal;
  text-align: center;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>NSU Course Scheduler</Title>
        <Subtitle>Find the perfect schedule that meets all your constraints</Subtitle>
      </Header>
      <main>
        <Dashboard />
      </main>
    </AppContainer>
  );
}

export default App; 
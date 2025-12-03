import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Journal from './pages/Journal';
import Crew from './pages/Crew';
import Characters from './pages/Characters';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Journal />} />
            <Route path="/crew" element={<Crew />} />
            <Route path="/characters" element={<Characters />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;

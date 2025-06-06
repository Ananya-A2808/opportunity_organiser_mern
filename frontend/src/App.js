import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';

import Registration from './pages/Registration';
import OtpVerification from './pages/OtpVerification';
import Landing from './pages/Landing_new';
import Categories from './pages/Categories';
import Opportunities from './pages/Opportunities';
import ResumeBuilder from './pages/ResumeBuilder_new';
import ResumeView from './pages/ResumeView';

import NavigationBar from './components/NavigationBar_new';
import theme from './theme_new';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <NavigationBar />
      <div style={{ paddingTop: '64px' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/verify-otp" element={<OtpVerification />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/opportunities/:category" element={<Opportunities />} />
          <Route path="/resume" element={<ResumeBuilder />} />
          <Route path="/resume/view" element={<ResumeView />} />
        </Routes>
      </div>
    </ThemeProvider>
  );
}

export default App;

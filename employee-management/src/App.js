import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Layout components
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import OceanMap from './pages/OceanMap'; 
import AnomalyDetection from './pages/AnomalyDetection';
import BiodiversityTracker from './pages/BiodiversityTracker';
import TimelinePlayer from './pages/TimelinePlayer';
import DisasterPrediction from './pages/DisasterPrediction';
import ResearchMode from './pages/ResearchMode';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="map" element={<OceanMap />} />
        <Route path="anomalies" element={<AnomalyDetection />} />
        <Route path="biodiversity" element={<BiodiversityTracker />} />
        <Route path="timeline" element={<TimelinePlayer />} />
        <Route path="disasters" element={<DisasterPrediction />} />
        <Route path="research" element={<ResearchMode />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
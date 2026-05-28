import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Spotter from './pages/Spotter';
import MyReports from './pages/MyReports';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="dashboard/:liveboardId" element={<Dashboard />} />
        <Route path="ai-analytics" element={<Spotter />} />
        <Route path="my-reports" element={<MyReports />} />
      </Route>
    </Routes>
  );
}

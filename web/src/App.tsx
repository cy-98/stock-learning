import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LayerFeedProvider } from './context/LayerFeedContext';
import { HomePage } from './pages/HomePage';
import { LayerPage } from './pages/LayerPage';
import { SpecPage } from './pages/SpecPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/stock-learning">
      <LayerFeedProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/layer/:id" element={<LayerPage />} />
          <Route path="/spec" element={<SpecPage />} />
          <Route path="/spec/:phase" element={<SpecPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayerFeedProvider>
    </BrowserRouter>
  );
}

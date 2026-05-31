import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LayerFeedProvider } from './context/LayerFeedProvider';
import { HomePage } from './pages/HomePage';
import { LayerPage } from './pages/LayerPage';
import { NewsPage } from './pages/NewsPage';
import { SpecPage } from './pages/SpecPage';
import { StockPage } from './pages/StockPage';
import { StocksBoardPage } from './pages/StocksBoardPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/stock-learning">
      <LayerFeedProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/board" element={<StocksBoardPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/layer/:id" element={<LayerPage />} />
          <Route path="/stock/:code" element={<StockPage />} />
          <Route path="/spec" element={<SpecPage />} />
          <Route path="/spec/:phase" element={<SpecPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </LayerFeedProvider>
    </BrowserRouter>
  );
}

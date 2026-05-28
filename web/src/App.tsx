import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LayerPage } from './pages/LayerPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/stock-learning">
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/layer/:id" element={<LayerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <nav className="bottom-nav" aria-label="主导航">
          <a className="nav-item active" href="/stock-learning/">
            <span className="nav-icon">⬡</span>
            <span>五层模型</span>
          </a>
          <a
            className="nav-item"
            href="https://github.com/cy-98/stock-learning"
            target="_blank"
            rel="noreferrer"
          >
            <span className="nav-icon">◈</span>
            <span>仓库</span>
          </a>
        </nav>
      </div>
    </BrowserRouter>
  );
}

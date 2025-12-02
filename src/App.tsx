/**
 * アプリケーションのルーティング設定
 */
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TeacherMode from './pages/TeacherMode';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/teacher" element={<TeacherMode />} />
      </Routes>
    </BrowserRouter>
  );
}


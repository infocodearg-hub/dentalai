import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Panel from './pages/Panel';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/panel" element={<Panel />} />
    </Routes>
  );
}

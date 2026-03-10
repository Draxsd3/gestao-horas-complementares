import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnviarCertificado from './pages/EnviarCertificado';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/enviar" element={<EnviarCertificado />} />
    </Routes>
  );
}

export default App;

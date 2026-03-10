import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnviarCertificado from './pages/EnviarCertificado';
import Perfil from './pages/Perfil';
import GruposHoras from './pages/GruposHoras';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/grupos" element={<GruposHoras />} />
      <Route path="/enviar" element={<EnviarCertificado />} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}

export default App;

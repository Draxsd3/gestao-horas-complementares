import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentCertificates from './pages/StudentCertificates';
import EnviarCertificado from './pages/EnviarCertificado';
import Perfil from './pages/Perfil';
import GruposHoras from './pages/GruposHoras';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProfessorStudents from './pages/ProfessorStudents';
import ProfessorCertificates from './pages/ProfessorCertificates';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/certificados" element={<StudentCertificates />} />
      <Route path="/professor" element={<ProfessorDashboard />} />
      <Route path="/professor/alunos" element={<ProfessorStudents />} />
      <Route path="/professor/certificados" element={<ProfessorCertificates />} />
      <Route path="/grupos" element={<GruposHoras />} />
      <Route path="/enviar" element={<EnviarCertificado />} />
      <Route path="/perfil" element={<Perfil />} />
    </Routes>
  );
}

export default App;

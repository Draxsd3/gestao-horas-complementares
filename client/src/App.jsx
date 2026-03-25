import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StudentCertificates from './pages/StudentCertificates';
import EnviarCertificado from './pages/EnviarCertificado';
import Perfil from './pages/Perfil';
import GruposHoras from './pages/GruposHoras';
import ProfessorDashboard from './pages/ProfessorDashboard';
import ProfessorStudents from './pages/ProfessorStudents';
import ProfessorStudentsList from './pages/ProfessorStudentsList';
import ProfessorCertificates from './pages/ProfessorCertificates';
import FirstAccessPassword from './pages/FirstAccessPassword';
import { getStoredUser, requiresPasswordChange } from './utils/session';

function StudentFirstAccessGuard({ children }) {
  const usuario = getStoredUser();

  if (requiresPasswordChange(usuario)) {
    return <Navigate to="/primeiro-acesso" replace />;
  }

  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/primeiro-acesso" element={<FirstAccessPassword />} />
      <Route path="/dashboard" element={<StudentFirstAccessGuard><Dashboard /></StudentFirstAccessGuard>} />
      <Route path="/certificados" element={<StudentFirstAccessGuard><StudentCertificates /></StudentFirstAccessGuard>} />
      <Route path="/professor" element={<ProfessorDashboard />} />
      <Route path="/professor/alunos" element={<ProfessorStudents />} />
      <Route path="/professor/alunos/listagem" element={<ProfessorStudentsList />} />
      <Route path="/professor/certificados" element={<ProfessorCertificates />} />
      <Route path="/grupos" element={<StudentFirstAccessGuard><GruposHoras /></StudentFirstAccessGuard>} />
      <Route path="/enviar" element={<StudentFirstAccessGuard><EnviarCertificado /></StudentFirstAccessGuard>} />
      <Route path="/perfil" element={<StudentFirstAccessGuard><Perfil /></StudentFirstAccessGuard>} />
    </Routes>
  );
}

export default App;

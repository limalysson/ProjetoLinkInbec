import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css'; 
import './App.mobile.css';
import VagasList from './VagasList';
import AlunoHome from './AlunoHome';

// --- Importação dos Componentes de Página ---
import RequestAccess from './RequestAccess'; 
import AuthenticateAccess from './AuthenticateAccess'; 
import CurriculumForm from './CurriculumForm';
import CompanyLandingPage from './CompanyLandingPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';
import Home from './Home';
import JobForm from './JobForm';
import AdminVagasDashboard from './AdminVagasDashboard';

// --- COMPONENTE DE PROTEÇÃO DE ROTA (ALUNO) ---
const ProtectedStudentRoute = ({ children, isAuthenticated, setAuthenticated, setAuthenticatedEmail }) => {
    const navigate = useNavigate();
    const location = useLocation(); 

    useEffect(() => {
        console.log('ProtectedStudentRoute useEffect - checking student token...');
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('ProtectedStudentRoute: No student token found. Redirecting to /aluno.');
            setAuthenticated(false);
            setAuthenticatedEmail(null);
            navigate('/aluno', { replace: true, state: { from: location.pathname } }); 
        } else {
            console.log('ProtectedStudentRoute: Student token found. User is authenticated.');
            setAuthenticated(true);
        }
    }, [isAuthenticated, navigate, setAuthenticated, setAuthenticatedEmail, location.pathname]);

    console.log('ProtectedStudentRoute render: isAuthenticated:', isAuthenticated); 

    if (isAuthenticated) {
        return children;
    }
    return null; 
};

// --- COMPONENTE DE PROTEÇÃO DE ROTA (ADMIN) ---
const ProtectedAdminRoute = ({ children, isAdminAuthenticated }) => {
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAdminAuthenticated) {
            navigate('/admin');
        }
    }, [isAdminAuthenticated, navigate]);

    return isAdminAuthenticated ? children : null; // ou um componente de loading
};

// --- Componente Principal da Aplicação (App) ---
function App() {
  const [authenticatedEmail, setAuthenticatedEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(!!localStorage.getItem('adminToken'));

  useEffect(() => {
    console.log('App.js initial useEffect: Checking local storage for tokens.');
    const studentToken = localStorage.getItem('token');
    if (studentToken) {
      setIsAuthenticated(true);
      console.log('App.js: Student token found. isAuthenticated set to TRUE.');
    } else {
      setIsAuthenticated(false);
      setAuthenticatedEmail(null); 
      console.log('App.js: No student token. isAuthenticated set to FALSE.');
    }

    const adminToken = localStorage.getItem('adminToken');
    console.log('App.js: adminToken from localStorage:', adminToken);
    if (adminToken) {
      setIsAdminAuthenticated(true);
      console.log('App.js: Admin token found. isAdminAuthenticated set to TRUE.');
    } else {
      setIsAdminAuthenticated(false);
      console.log('App.js: No admin token. isAdminAuthenticated set to FALSE.');
    }
  }, []);

  // Função para ser chamada pelo AdminLogin
  const handleAdminLogin = () => {
      setIsAdminAuthenticated(true);
  };

  // Função de logout do admin
  const handleAdminLogout = () => {
      localStorage.removeItem('adminToken');
      setIsAdminAuthenticated(false);
      // Opcional: redirecionar para a página de login do admin
      // navigate('/admin/login');
  };

  return (
      <div className="App">
        <header className="App-header">
          <h1>Vitrine Acadêmica</h1>
          <p className="header-welcome-message">Bem-vindo à Plataforma de Currículos de alunos.</p>        
        </header>
        <main>
          <Routes>
            
            <Route path="/" element={<Home />} />
            
            <Route path="/aluno" element={<RequestAccess setAuthenticatedEmail={setAuthenticatedEmail} />} />

            <Route path="/aluno/autenticar" element={
              <AuthenticateAccess
                email={authenticatedEmail} 
                setAuthenticated={setIsAuthenticated}
                setAuthenticatedEmail={setAuthenticatedEmail}
              />
            } />

            <Route path="/aluno/curriculo" element={
              <ProtectedStudentRoute 
                isAuthenticated={isAuthenticated} 
                setAuthenticated={setIsAuthenticated}
                setAuthenticatedEmail={setAuthenticatedEmail}
              >
                <CurriculumForm />
              </ProtectedStudentRoute>
            } />

            <Route path="/empresa" element={<CompanyLandingPage />} />

            {/* Rota de Login do Admin */}
            <Route path="/admin" element={<AdminLogin onAdminLogin={handleAdminLogin} />} />

            {/* Rota Protegida do Dashboard */}
            <Route 
                path="/admin/dashboard"
                element={
                    <ProtectedAdminRoute isAdminAuthenticated={isAdminAuthenticated}>
                        <AdminDashboard onAdminLogout={handleAdminLogout} />
                    </ProtectedAdminRoute>
                } 
            />
            <Route path="/admin/cadastrar-vaga" element={<JobForm />} />
            <Route
              path="/admin/vagas"
              element={
                <ProtectedAdminRoute isAdminAuthenticated={isAdminAuthenticated}>
                  <AdminVagasDashboard />
                </ProtectedAdminRoute>
              }
            />
            <Route path="*" element={<h2>Página Não Encontrada</h2>} />
            <Route
              path="/aluno/vagas"
              element={
                <ProtectedStudentRoute
                  isAuthenticated={isAuthenticated}
                  setAuthenticated={setIsAuthenticated}
                  setAuthenticatedEmail={setAuthenticatedEmail}
                >
                  <VagasList />
                </ProtectedStudentRoute>
              }
            />
            <Route
              path="/aluno/home"
              element={
                <ProtectedStudentRoute
                  isAuthenticated={isAuthenticated}
                  setAuthenticated={setIsAuthenticated}
                  setAuthenticatedEmail={setAuthenticatedEmail}
                >
                  <AlunoHome />
                </ProtectedStudentRoute>
              }
            />
          </Routes>
        </main>
      </div>
  );
}

export default App;
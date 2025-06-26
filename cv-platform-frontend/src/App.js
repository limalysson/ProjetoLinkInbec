import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import './App.css'; 

// --- Importação dos Componentes de Página ---
import RequestAccess from './RequestAccess'; 
import AuthenticateAccess from './AuthenticateAccess'; 
import CurriculumForm from './CurriculumForm';
import CompanyLandingPage from './CompanyLandingPage';
import AdminLogin from './AdminLogin';
import AdminDashboard from './AdminDashboard';

// --- COMPONENTE DE PROTEÇÃO DE ROTA (ALUNO) ---
const ProtectedStudentRoute = ({ children, isAuthenticated, setAuthenticated, setAuthenticatedEmail }) => { /* ... */ return null; };

// --- COMPONENTE DE PROTEÇÃO DE ROTA (ADMIN) ---
const ProtectedAdminRoute = ({ children, isAdminAuthenticated, setIsAdminAuthenticated }) => { /* ... */ return null; };


// --- Componente Principal da Aplicação (App) ---
function App() {
  const [authenticatedEmail, setAuthenticatedEmail] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // useLocation ainda é usado nas ProtectedRoutes
  // A variável isCompanyPage não é mais necessária aqui
  // const location = useLocation();

  useEffect(() => {
    // ... (useEffect existente para verificar tokens) ...
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

  const handleStudentLogout = () => { /* ... */ };
  const handleAdminLogout = () => { /* ... */ };

  return (
    <div className="App">
      <header className="App-header">
        <h1>LinkInbec</h1>
        {/* NOVA MENSAGEM DE BOAS-VINDAS NO HEADER */}
        <p className="header-welcome-message">Plataforma de Currículos INBEC.</p>
        
        <div className="header-logout-buttons">
          {isAuthenticated && (
            <button onClick={handleStudentLogout} className="logout-button">Sair (Aluno)</button>
          )}
          {isAdminAuthenticated && (
            <button onClick={handleAdminLogout} className="logout-button">Sair (Admin)</button>
          )}
        </div>
      </header>
      <main>
        <Routes>
          <Route path="/" element={
            <div className="home-login-options-container"> {/* NOVO CONTAINER */}
              <p className="home-instruction-text">Selecione uma área para começar:</p> {/* NOVO TEXTO */}
              <div className="home-buttons-group"> {/* NOVO GRUPO DE BOTÕES */}
                <Link to="/aluno" className="nav-button home-button">Área do Aluno</Link>
                <Link to="/admin" className="nav-button home-button">Área do Administrador</Link>
              </div>
            </div>
          } />
          
          <Route path="/aluno" element={<RequestAccess setAuthenticatedEmail={setAuthenticatedEmail} />} />
          <Route path="/aluno/autenticar" element={
            <AuthenticateAccess
              email={authenticatedEmail} 
              setAuthenticated={setIsAuthenticated}
              setAuthenticatedEmail={setAuthenticatedEmail}
            />
          } />
          <Route path="/aluno/cadastro" element={
            <ProtectedStudentRoute 
              isAuthenticated={isAuthenticated} 
              setAuthenticated={setIsAuthenticated}
              setAuthenticatedEmail={setAuthenticatedEmail}
            >
              <CurriculumForm />
            </ProtectedStudentRoute>
          } />

          <Route path="/empresa" element={<CompanyLandingPage />} />

          <Route path="/admin" element={<AdminLogin setAdminAuthenticated={setIsAdminAuthenticated} />} />
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute
              isAdminAuthenticated={isAdminAuthenticated}
              setIsAdminAuthenticated={setIsAdminAuthenticated}
            >
              <AdminDashboard />
            </ProtectedAdminRoute>
          } />
          <Route path="*" element={<h2>Página Não Encontrada</h2>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
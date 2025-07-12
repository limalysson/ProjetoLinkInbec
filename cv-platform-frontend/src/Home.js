import React from 'react';
import { Link } from 'react-router-dom';
import './App.css';
import './App.mobile.css';

function Home() {
  return (
    <div className="home-login-options-container">             
      <p className="home-instruction-text">Selecione uma área para começar:</p>
      <div className="home-buttons-group">
        <div className="home-button-card">
          <h2 className="home-button-title">Área do aluno</h2>
          <div className="home-button-separator"></div>
          <p className="home-button-description">
            Cadastre seus dados,<br/>
            crie seu currículo e<br/>
            mantenha suas informações<br/>
            sempre atualizadas.<br/><br/>
          </p>
          <div className="home-button-separator"></div>
          <Link to="/aluno" className="nav-button home-button-link">Acessar</Link>
        </div>

        <div className="home-button-card">
          <h2 className="home-button-title">Área do administrador</h2>
          <div className="home-button-separator"></div>
          <p className="home-button-description">
            Visualize os currículos<br/>
            cadastrados, analise os<br/>
            dados e gerencie a&nbsp;<br/>
            visibilidade para as empresas.<br/><br/>
          </p>
          <div className="home-button-separator"></div>
          <Link to="/admin" className="nav-button home-button-link">Acessar</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
import React from 'react';
import { useNavigate } from 'react-router-dom';


function AlunoHome() {
    const navigate = useNavigate();
  return (
    <div className="home-login-options-container">             
      <h2>Bem-vindo!</h2>
      <div className="home-buttons-group">
        <div className="home-button-card">
          <h2 className="home-button-title">Currículo</h2>
          <div className="home-button-separator"></div>
          <p className="home-button-description">
            Cadastre seus dados,<br/>
            crie seu currículo e<br/>
            mantenha suas informações<br/>
            sempre atualizadas.<br/><br/>
          </p>
          <button
                    className="action-button glass-action-button"
                    onClick={() => navigate('/aluno/curriculo')}
                >
                    Criar ou Editar Currículo
                </button>
        </div>

        <div className="home-button-card">
          <h2 className="home-button-title">Vagas Disponíveis</h2>
          <div className="home-button-separator"></div>
          <p className="home-button-description">
                        
            Visualize as vagas<br/>
            cadastradas.<br/>
            Candidate-se às que<br/>
            mais lhe interessam.<br/><br/>
            
            
          </p>
          <button
                    className="action-button glass-action-button"
                    onClick={() => navigate('/aluno/vagas')}
                >
                    Visualizar Vagas Disponíveis
                </button>
        </div>
      </div>
    </div>
  );
}

// export default Home;


// function AlunoHome() {
//     const navigate = useNavigate();

//     return (

        

//         <div className="aluno-home-container">
            
//             <p>O que você deseja fazer?</p>
//             <div className="aluno-home-actions">
//                 <button
//                     className="action-button glass-action-button"
//                     onClick={() => navigate('/aluno/curriculo')}
//                 >
//                     Criar ou Editar Currículo
//                 </button>
                
//             </div>
//         </div>
//     );
// }

export default AlunoHome;
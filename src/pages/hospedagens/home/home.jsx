import React from 'react';
import { useNavigate } from 'react-router-dom';
import './home.css';

const HomeScreen = () => {
  const navigate = useNavigate();

  const handleNavigateToRegister = () => {
    navigate('/register'); 
  };

  return (
    <div className="home-container">
      <div className="logo-container">
        <h1 className="logo">PetFamily</h1>
      </div>
      
      <div className="button-container">
        <button 
          className="main-button"
          onClick={handleNavigateToRegister}
        >
          Tenho uma hospedagem
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
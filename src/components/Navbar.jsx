import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="brand">
          Gestão de Funcionários
        </Link>
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`}>
            Dashboard
          </Link>
          <Link to="/cadastrar" className={`nav-link ${isActive('/cadastrar')}`}>
            Novo Funcionário
          </Link>
          <Link to="/funcionarios" className={`nav-link ${isActive('/funcionarios')}`}>
            Funcionários
          </Link>
          <Link to="/configuracoes" className={`nav-link ${isActive('/configuracoes')}`}>
            Configurações
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

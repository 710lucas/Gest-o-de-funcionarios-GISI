import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, Settings } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    // Bottom navigation bar para mobile
    return (
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 1000,
        padding: '0.5rem 0'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          maxWidth: '100%'
        }}>
          <Link 
            to="/" 
            className={`nav-link-mobile ${isActive('/')}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              textDecoration: 'none',
              color: location.pathname === '/' ? '#3b82f6' : '#6b7280',
              fontSize: '0.7rem',
              fontWeight: '500',
              flex: 1
            }}
          >
            <LayoutDashboard size={24} />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/cadastrar" 
            className={`nav-link-mobile ${isActive('/cadastrar')}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              textDecoration: 'none',
              color: location.pathname === '/cadastrar' ? '#3b82f6' : '#6b7280',
              fontSize: '0.7rem',
              fontWeight: '500',
              flex: 1
            }}
          >
            <UserPlus size={24} />
            <span>Novo</span>
          </Link>
          
          <Link 
            to="/funcionarios" 
            className={`nav-link-mobile ${isActive('/funcionarios')}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              textDecoration: 'none',
              color: location.pathname === '/funcionarios' ? '#3b82f6' : '#6b7280',
              fontSize: '0.7rem',
              fontWeight: '500',
              flex: 1
            }}
          >
            <Users size={24} />
            <span>Lista</span>
          </Link>
          
          <Link 
            to="/configuracoes" 
            className={`nav-link-mobile ${isActive('/configuracoes')}`}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem',
              textDecoration: 'none',
              color: location.pathname === '/configuracoes' ? '#3b82f6' : '#6b7280',
              fontSize: '0.7rem',
              fontWeight: '500',
              flex: 1
            }}
          >
            <Settings size={24} />
            <span>Config</span>
          </Link>
        </div>
      </nav>
    );
  }

  // Desktop navigation bar
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

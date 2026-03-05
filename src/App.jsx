import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import ListaFuncionarios from './pages/ListaFuncionarios';
import Config from './pages/Config';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cadastrar" element={<Cadastro />} />
        <Route path="/funcionarios" element={<ListaFuncionarios />} />
        <Route path="/configuracoes" element={<Config />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

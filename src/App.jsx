import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import ListaFuncionarios from './pages/ListaFuncionarios';
import Config from './pages/Config';
import Relatorios from './pages/Relatorios';
import Projetos from './pages/Projetos';
import Analytics from './pages/Analytics';
import SkillGaps from './pages/SkillGaps';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cadastrar" element={<Cadastro />} />
        <Route path="/funcionarios" element={<ListaFuncionarios />} />
        <Route path="/projetos" element={<Projetos />} />
        <Route path="/skill-gaps" element={<SkillGaps />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Config />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import ListaFuncionarios from './pages/ListaFuncionarios';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/cadastrar" element={<Cadastro />} />
        <Route path="/funcionarios" element={<ListaFuncionarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

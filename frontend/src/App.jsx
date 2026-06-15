import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css'

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import Footer from './components/Footer';

import AvisoLogin from './pages/AvisoLogin';
import Home from './pages/Home';
import Informacoes from './pages/Informacoes';
import Missoes from './pages/Missoes';
import Recompensas from './pages/Recompensas';
import Perfil from './pages/Perfil';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/aviso-login" element={<AvisoLogin />} />
            <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />      
            <Route path="/login" element={<Login />} />

            <Route path="/missoes" element={<PrivateRoute><Missoes /></PrivateRoute>} />
            <Route path="/informacoes" element={<PrivateRoute><Informacoes /></PrivateRoute>} />
            <Route path="/recompensas" element={<PrivateRoute><Recompensas /></PrivateRoute>} />
            <Route path="/perfil" element={<PrivateRoute><Perfil /></PrivateRoute>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter >
  )
}

export default App

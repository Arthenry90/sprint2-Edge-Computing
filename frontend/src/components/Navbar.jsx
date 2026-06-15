import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import logo from '../../src/assets/Careplus_logo.png';

function Navbar() {
  const [isLogged, setIsLogged] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Verificar se o usuario está logado em sistema
  useEffect(() => {
    const status = localStorage.getItem('isLogged') === 'true';
    setIsLogged(status);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('isLogged');
    localStorage.removeItem('user');
    setIsLogged(false);
    navigate('/');
  };

  return (
    <header className="m-5">
      <nav className="w-[95%] max-w-[750px] mx-auto h-[60px] flex items-center justify-center border-2 border-[#1C9770] rounded-full px-8 py-3 gap-6">
        <img src={logo} alt="Logo Care Plus" className="h-[100px] w-[100px]" />

        <ul className="flex list-none m-0 gap-5">
          <li>
            <NavLink to="/" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>Início</NavLink>
          </li>
          <li>
            <NavLink to="/missoes" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>Missões</NavLink>
          </li>
          <li>
            <NavLink to="/informacoes" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>Informações</NavLink>
          </li>
          <li>
            <NavLink to="/recompensas" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>Recompensas</NavLink>
          </li>
          <li>
            <NavLink to="/perfil" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>Perfil</NavLink>
          </li>
          
          <li>
            {isLogged ? (
              <button onClick={handleLogout} className="text-[#1C9770] font-bold hover:text-red-500 transition-colors">
                Logout
              </button>
            ) : (
              <NavLink to="/login" className={({isActive}) => isActive ? "text-[#93CB52] font-bold" : "text-[#1C9770] font-bold hover:text-[#93CB52]"}>
                Login
              </NavLink>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Navbar;
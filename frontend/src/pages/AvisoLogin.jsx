import { Link } from 'react-router-dom';

function AvisoLogin() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <div className="border-2 border-[#1C9770] rounded-[40px] p-10 max-w-md w-full bg-white shadow-xl">
        <h2 className="text-[#1C9770] font-bold text-2xl mb-4">Acesso Restrito</h2>
        <p className="text-gray-600 mb-8">
          Para acessar esta página e continuar cuidando da sua saúde, você precisa realizar o login.
        </p>
        <Link 
          to="/login" 
          className="bg-[#1C9770] text-white px-8 py-3 rounded-full font-bold hover:bg-[#93CB52] transition-all"
        >
          Ir para o Login
        </Link>
      </div>
    </div>
  );
}

export default AvisoLogin;
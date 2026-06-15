import { useState, useEffect } from 'react';

function Recompensas() {
  const [usuario, setUsuario] = useState(null);
  const [resgatados, setResgatados] = useState({});

  useEffect(() => {
    const dados = localStorage.getItem('user');
    if (dados) setUsuario(JSON.parse(dados));
  }, []);

  const handleResgatar = (index, pontosNecessarios) => {
    if (usuario.pontos >= pontosNecessarios) {
      const novaPontuacao = usuario.pontos - pontosNecessarios;
      const usuarioAtualizado = { ...usuario, pontos: novaPontuacao };
      
      setUsuario(usuarioAtualizado);
      localStorage.setItem('user', JSON.stringify(usuarioAtualizado));
      
      setResgatados(prev => ({ ...prev, [index]: true }));
      
      alert("Resgate realizado com sucesso!");
    } else {
      alert("Pontos insuficientes!");
    }
  };

  if (!usuario) return <div>Carregando...</div>;
  
  const itens = [
    { nome: "Garrafa", pontos: 300, img: "/assets/garrafa_agua.png" },
    { nome: "Escova", pontos: 300, img: "/assets/escova_dentes.png" },
    { nome: "Moletom", pontos: 500, img: "/assets/moletom.png" },
    { nome: "Mochila", pontos: 800, img: "/assets/mochila.png" },
  ];

  return (
    <main className="container mx-auto py-8 px-4">
      {/* Header de Pontos */}
      <div className="flex flex-col md:flex-row bg-[#7AD1C3] rounded-[15px] mb-8 overflow-hidden shadow-md">
        <div className="bg-[#1C9770]/70 p-6 text-white text-center">
          <h2 className="text-sm font-semibold">TOTAL DE PONTOS</h2>
          <p className="text-3xl font-bold">{usuario.pontos || 0}</p>
        </div>
        <div className="flex items-center justify-center p-6 text-gray-800 font-bold">
          COLETE PONTOS PARA RECEBER RECOMPENSAS
        </div>
      </div>

      {/* Grid de Recompensas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {itens.map((item, index) => (
          <div key={index} className="bg-[#93CB52] p-4 rounded-[15px] text-center shadow-sm flex flex-col items-center">
            <img src={item.img} alt={item.nome} className="w-full h-auto max-h-[300px] object-contain mb-3" />
            <p className="font-bold text-white mb-2">{item.pontos} PONTOS</p>
            
            <button 
              disabled={resgatados[index]} 
              onClick={() => handleResgatar(index, item.pontos)}
              className={`font-bold py-2 px-6 rounded-full transition ${
                resgatados[index] 
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed" 
                  : "bg-white text-[#1C9770] hover:bg-gray-100"
              }`}
            >
              {resgatados[index] ? "Item Resgatado" : "Resgatar"}
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}

export default Recompensas;
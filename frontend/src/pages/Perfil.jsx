import { useState, useEffect } from 'react';

function Perfil() {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const dados = localStorage.getItem('user');
    if (dados) {setUsuario(JSON.parse(dados));}
  }, []);
  
  if (!usuario) {
    return <div className="text-center p-10">Carregando perfil...</div>;
  }

return (
<main className="container mx-auto px-4 py-8">
  <section className="max-w-4xl mx-auto bg-[#93CB52] p-8 rounded-[40px] shadow-xl text-white">   
    <h2 className="text-2xl font-bold mb-6">Olá, {usuario.nome}!</h2>

    <div className="flex flex-col md:flex-row gap-8">
      <div className="flex-1 space-y-4">
        <div>
          <label className="font-bold block mb-1">Nome:</label>
          <div className="bg-white/50 rounded-full px-6 py-3 text-gray-900 font-medium">
            {usuario.nome}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="font-bold block mb-1 text-center">Peso:</label>
            <div className="bg-white/50 rounded-full py-3 text-gray-900 text-center font-medium">{usuario.peso ? `${usuario.peso} kg` : "---"}</div>
          </div>
          <div>
            <label className="font-bold block mb-1 text-center">Altura:</label>
            <div className="bg-white/50 rounded-full py-3 text-gray-900 text-center font-medium">{usuario.altura ? `${parseFloat(usuario.altura).toFixed(2).replace('.', ',')} m` : "---"}</div>
          </div>
          <div>
            <label className="font-bold block mb-1 text-center">Idade:</label>
            <div className="bg-white/50 rounded-full py-3 text-gray-900 text-center font-medium">{usuario.idade ? `${usuario.idade} anos` : "---"}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-bold block mb-1">Data de nascimento:</label>
            <div className="bg-white/50 rounded-full px-6 py-3 text-gray-900 font-medium">{usuario.data_nascimento || "Não informado"}</div>
          </div>
          <div>
            <label className="font-bold block mb-1">Possui alguma deficiência:</label>
            <div className="bg-white/50 rounded-full px-6 py-3 text-gray-900 font-medium">{usuario.deficiencias || "Não informado"}</div>
          </div>
        </div>
      </div>
      {/* Foto de Perfil */}
      <div className="flex flex-col items-center justify-center">
        <div className="w-48 h-48 bg-gray-200 rounded-full border-4 border-white overflow-hidden mb-2">
          <img src={usuario.foto} alt="Foto de Perfil" className="w-full h-full object-cover"/>
        </div>
        <p className="text-sm underline cursor-pointer">Alterar foto de perfil</p>
      </div>
    </div>
  </section>
</main>
);
}

export default Perfil;
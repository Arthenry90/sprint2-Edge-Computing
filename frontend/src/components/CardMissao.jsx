function CardMissao({ titulo, percentual, status, corBotao, corProgresso, corFrente }) {
  return (
    <div 
      className="p-3 rounded-[15px] shadow-sm flex flex-col items-center w-full"
      style={{ backgroundColor: corFrente }}
    >
      <p className="font-bold text-white mb-3 text-center text-sm">{titulo}</p>
        <div 
        className="rounded-full w-17 h-17 flex items-center justify-center mb-3"
        style={{ 
          background: `conic-gradient(${corProgresso} ${percentual}%, #f3f4f6 ${percentual}%)`
        }}
        >
            <div className="text-white rounded-full w-[60px] h-[60px] flex items-center justify-center font-bold text-sm" style={{ backgroundColor: corFrente }}>
            {percentual}%
            </div>
        </div>
        <button className="w-full py-1.5 rounded-full font-bold text-white text-xs" style={{ backgroundColor: corBotao }}>
        {status}
        </button>
    </div>
  );
}
export default CardMissao;
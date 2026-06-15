import { useMemo } from 'react';
import CardMissao from '../components/CardMissao';
import useInfluxDB from '../hooks/useInfluxDB';

const dadosIoTPadrao = {
  temp: 36.5,
  passos: 4,
  velocidade: 5.2,
  meta: 10,
  bpm: 112,
  sys: 124,
  dia: 82,
};

function Missoes({ dadosIoT: dadosIoTProp }) {
  const { dadosIoT: dadosIoTLive, loading, error } = useInfluxDB();
  const dados = dadosIoTProp ?? dadosIoTLive ?? dadosIoTPadrao;
  const dadosFormatados = useMemo(() => JSON.stringify(dados, null, 2), [dados]);

  const config = {
    concluida: { fundo: "bg-[#1C9770]/50", frente: "#1C9770", btn: "#93CB52", tituloCor: "#1C9770" },
    progresso: { fundo: "bg-[#7AD1C3]/50", frente: "#7AD1C3", btn: "#93CB52", tituloCor: "#7AD1C3" },
    pendente:  { fundo: "bg-[#95E495]/60", frente: "#7AD180", btn: "#CB5252", tituloCor: "#7AD180" }
  };
  const tipos = ['concluida', 'progresso', 'pendente'];

  const missoes = useMemo(() => {
    const passos = Number(dados?.passos) || 0;
    const meta = Number(dados?.meta) || 0;
    const velocidade = Number(dados?.velocidade) || 0;
    const bpm = Number(dados?.bpm) || 0;
    const temp = Number(dados?.temp) || 0;
    const sys = Number(dados?.sys) || 0;

    const percentualCaminhada = meta > 0 ? Math.min(100, Math.round((passos * 100) / meta)) : 0;
    const faltamPassos = Math.max(meta - passos, 0);
    const caminhadaConcluida = meta > 0 && passos >= meta;
    const zonaCardio = velocidade > 1.5 && bpm >= 110 && bpm <= 160;
    const sinaisProtegidos = temp >= 36.0 && temp <= 37.3 && sys >= 90 && sys <= 130;

    return [
      {
        titulo: 'Caminhada Diária',
        percentual: percentualCaminhada,
        status: caminhadaConcluida ? 'Meta concluída!' : `Faltam ${faltamPassos} passos para a meta`,
        tipo: caminhadaConcluida ? 'concluida' : 'progresso',
      },
      {
        titulo: 'Queima de Gordura',
        percentual: zonaCardio ? 100 : 0,
        status: zonaCardio ? 'Zona de cardio ativa!' : 'Fora da zona de cardio',
        tipo: zonaCardio ? 'concluida' : 'pendente',
      },
      {
        titulo: 'Sinais Protegidos',
        percentual: sinaisProtegidos ? 100 : 0,
        status: sinaisProtegidos ? 'Sinais dentro da faixa ideal' : 'Ajuste temperatura e pressão',
        tipo: sinaisProtegidos ? 'concluida' : 'pendente',
      },
    ];
  }, [dados]);

  const missoesPorTipo = useMemo(() => {
    return missoes.reduce((acumulado, missao) => {
      if (!acumulado[missao.tipo]) {
        acumulado[missao.tipo] = [];
      }

      acumulado[missao.tipo].push(missao);
      return acumulado;
    }, { concluida: [], progresso: [], pendente: [] });
  }, [missoes]);

  return (
    <main className="container mx-auto py-8 px-4">
      <section className="mb-8 rounded-[20px] border border-white/20 bg-white/80 p-5 shadow-sm backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold" style={{ color: config.concluida.tituloCor }}>
              Dados recebidos do InfluxDB
            </h2>
            <p className="text-sm text-slate-600">
              Este painel mostra o último payload usado para calcular as missões.
            </p>
          </div>
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: config.progresso.btn }}>
            {loading ? 'Atualizando...' : 'Online'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Temp</p>
            <p className="text-lg font-bold text-slate-800">{dados.temp} °C</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Passos</p>
            <p className="text-lg font-bold text-slate-800">{dados.passos}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Meta</p>
            <p className="text-lg font-bold text-slate-800">{dados.meta}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">Velocidade</p>
            <p className="text-lg font-bold text-slate-800">{dados.velocidade} m/s</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">BPM</p>
            <p className="text-lg font-bold text-slate-800">{dados.bpm}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">SYS</p>
            <p className="text-lg font-bold text-slate-800">{dados.sys}</p>
          </div>
          <div className="rounded-2xl bg-slate-50 p-3">
            <p className="text-xs uppercase text-slate-500">DIA</p>
            <p className="text-lg font-bold text-slate-800">{dados.dia}</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-950 p-4 text-slate-100">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-bold">Payload atual</p>
            <span className="text-xs text-slate-400">{loading ? 'buscando...' : 'último dado aplicado'}</span>
          </div>
          <pre className="overflow-x-auto text-xs leading-6">{dadosFormatados}</pre>
        </div>
      </section>

      {loading && (
        <p className="mb-4 text-sm font-medium" style={{ color: config.progresso.tituloCor }}>
          Sincronizando dados do ESP32 via InfluxDB...
        </p>
      )}

      {error && (
        <p className="mb-4 text-sm font-medium text-red-600">
          Falha ao buscar dados do InfluxDB: {error}
        </p>
      )}

      {tipos.map((tipo) => (
        <div key={tipo} className="mb-8">
        <h3 className="font-bold mb-4 capitalize" style={{ color: config[tipo].tituloCor }}>{tipo}</h3>
        <section key={tipo} className={`p-6 rounded-[20px] mb-8 ${config[tipo].fundo}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
            {missoesPorTipo[tipo].map((m, i) => (
              <CardMissao 
                key={i} 
                titulo={m.titulo} 
                percentual={m.percentual} 
                status={m.status} 
                corBotao={config[tipo].btn}
                corProgresso={config[tipo].btn} 
                corFrente={config[tipo].frente} 
              />
            ))}
          </div>
        </section>
        </div>
      ))}

    </main>
  );
}
export default Missoes;
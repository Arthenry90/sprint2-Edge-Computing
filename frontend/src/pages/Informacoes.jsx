import { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useInfluxDB from '../hooks/useInfluxDB';

const numerosFormatados = new Intl.NumberFormat('pt-BR', {
  maximumFractionDigits: 1,
});

const dataHoraFormatada = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function formatarValor(valor) {
  return numerosFormatados.format(valor);
}

function Informacoes() {
  const { dadosIoT, historico, ultimoAtualizado, loading, error } = useInfluxDB();

  const pontos = useMemo(() => {
    const base = historico.length > 0
      ? historico
      : [{ ...dadosIoT, timestamp: ultimoAtualizado || new Date().toISOString() }];

    return base.map((item, indice) => ({
      ...item,
      indice,
      rotulo: dataHoraFormatada.format(new Date(item.timestamp || Date.now())),
    }));
  }, [dadosIoT, historico, ultimoAtualizado]);

  const ultimo = pontos[pontos.length - 1] || dadosIoT;

  const indicadores = [
    { label: 'Temperatura', value: `${formatarValor(ultimo.temp)} °C`, accent: 'from-[#1C9770] to-[#7AD1C3]' },
    { label: 'Passos', value: formatarValor(ultimo.passos), accent: 'from-[#93CB52] to-[#7AD180]' },
    { label: 'Meta', value: formatarValor(ultimo.meta), accent: 'from-[#1C9770] to-[#93CB52]' },
    { label: 'Velocidade', value: `${formatarValor(ultimo.velocidade)} m/s`, accent: 'from-[#7AD1C3] to-[#95E495]' },
    { label: 'BPM', value: formatarValor(ultimo.bpm), accent: 'from-[#CB5252] to-[#E85D5D]' },
    { label: 'SYS', value: formatarValor(ultimo.sys), accent: 'from-[#1C9770] to-[#7AD1C3]' },
    { label: 'DIA', value: formatarValor(ultimo.dia), accent: 'from-[#93CB52] to-[#7AD180]' },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8 rounded-[28px] border border-white/20 bg-gradient-to-br from-[#0f3d33] via-[#145448] to-[#eef8f2] p-6 shadow-[0_20px_60px_rgba(18,72,61,0.25)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-[#93CB52]">Dashboard ao vivo</p>
            <h1 className="text-3xl font-black text-white md:text-5xl">Informações</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80 md:text-base">
              Acompanhe os dados recebidos do ESP32 em tempo real, com visão consolidada, histórico curto e leitura do último pacote gravado no InfluxDB.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 px-4 py-3 text-white backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.25em] text-white/70">Última atualização</p>
            <p className="mt-1 text-lg font-bold">{ultimoAtualizado ? dataHoraFormatada.format(new Date(ultimoAtualizado)) : 'Aguardando dados'}</p>
          </div>
        </div>
      </section>

      {loading && (
        <p className="mb-4 rounded-2xl bg-[#eef8f2] px-4 py-3 text-sm font-medium text-[#145448] shadow-sm">
          Carregando dados do InfluxDB...
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 shadow-sm">
          Falha ao buscar dados do InfluxDB: {error}
        </p>
      )}

      <section className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
        {indicadores.map((item) => (
          <article key={item.label} className="rounded-[22px] border border-white/60 bg-white p-4 shadow-sm">
            <div className={`mb-3 h-2 rounded-full bg-gradient-to-r ${item.accent}`} />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-2 text-xl font-black text-slate-900">{item.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Sinais vitais</h2>
              <p className="text-sm text-slate-500">Temperatura, BPM, SYS e DIA nas últimas leituras.</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={pontos}>
                <defs>
                  <linearGradient id="tempFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1C9770" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#1C9770" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="bpmFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#CB5252" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#CB5252" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="rotulo" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="temp" name="Temp" stroke="#1C9770" fill="url(#tempFill)" />
                <Area type="monotone" dataKey="bpm" name="BPM" stroke="#CB5252" fill="url(#bpmFill)" />
                <Line type="monotone" dataKey="sys" name="SYS" stroke="#7AD1C3" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="dia" name="DIA" stroke="#93CB52" strokeWidth={2.5} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-900">Movimento e meta</h2>
              <p className="text-sm text-slate-500">Passos, meta e velocidade em série temporal.</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pontos}>
                <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
                <XAxis dataKey="rotulo" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Bar dataKey="passos" name="Passos" fill="#1C9770" radius={[10, 10, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#93CB52" radius={[10, 10, 0, 0]} />
                <Bar dataKey="velocidade" name="Velocidade" fill="#7AD1C3" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-black text-slate-900">Último pacote recebido</h2>
          <p className="mb-4 text-sm text-slate-500">Objeto normalizado que alimenta as missões e os gráficos.</p>
          <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-6 text-slate-100">{JSON.stringify(dadosIoT, null, 2)}</pre>
        </article>

        <article className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-lg font-black text-slate-900">Resumo do estado</h2>
          <p className="mb-4 text-sm text-slate-500">Leitura atual aplicada ao dashboard.</p>

          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Passos x Meta</span>
                <span>{formatarValor(ultimo.passos)} / {formatarValor(ultimo.meta)}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#1C9770] to-[#93CB52]"
                  style={{ width: `${Math.min(100, (Number(ultimo.passos) * 100) / (Number(ultimo.meta) || 1))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Zona cardíaca</span>
                <span>{ultimo.bpm >= 110 && ultimo.bpm <= 160 ? 'Ativa' : 'Fora'}</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className={`h-3 rounded-full ${ultimo.bpm >= 110 && ultimo.bpm <= 160 ? 'bg-gradient-to-r from-[#93CB52] to-[#1C9770]' : 'bg-gradient-to-r from-[#CB5252] to-[#E85D5D]'}`}
                  style={{ width: `${Math.min(100, Number(ultimo.bpm))}%` }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between text-sm font-medium text-slate-700">
                <span>Temperatura corporal</span>
                <span>{formatarValor(ultimo.temp)} °C</span>
              </div>
              <div className="h-3 rounded-full bg-slate-100">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#7AD1C3] to-[#1C9770]"
                  style={{ width: `${Math.min(100, (Number(ultimo.temp) / 40) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </article>
      </section>
    </main>
  );
}

export default Informacoes;
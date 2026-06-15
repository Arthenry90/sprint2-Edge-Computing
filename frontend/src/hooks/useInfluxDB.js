import { useCallback, useEffect, useState } from 'react';

const dadosPadrao = {
  temp: 36.5,
  passos: 0,
  velocidade: 0,
  meta: 10,
  bpm: 0,
  sys: 0,
  dia: 0,
};

function parseInfluxCsv(csvText) {
  const linhas = csvText
    .trim()
    .split(/\r?\n/)
    .filter((linha) => linha && !linha.startsWith('#'));

  if (linhas.length < 2) {
    return null;
  }

  const splitCsvLine = (linha) => {
    const campos = [];
    let campoAtual = '';
    let dentroDeAspas = false;

    for (let indice = 0; indice < linha.length; indice += 1) {
      const caractere = linha[indice];

      if (caractere === '"') {
        const proximo = linha[indice + 1];
        if (dentroDeAspas && proximo === '"') {
          campoAtual += '"';
          indice += 1;
        } else {
          dentroDeAspas = !dentroDeAspas;
        }
        continue;
      }

      if (caractere === ',' && !dentroDeAspas) {
        campos.push(campoAtual);
        campoAtual = '';
        continue;
      }

      campoAtual += caractere;
    }

    campos.push(campoAtual);
    return campos;
  };

  const cabecalho = splitCsvLine(linhas[0]);
  const valores = splitCsvLine(linhas[linhas.length - 1]);

  return cabecalho.reduce((acumulado, coluna, indice) => {
    acumulado[coluna] = valores[indice];
    return acumulado;
  }, {});
}

function tentarParseJson(valor) {
  if (typeof valor !== 'string') {
    return null;
  }

  const texto = valor.trim();

  if (!texto.startsWith('{') && !texto.startsWith('[')) {
    return null;
  }

  try {
    return JSON.parse(texto);
  } catch {
    return null;
  }
}

function extrairRegistroUtil(dadosBrutos, csvText) {
  const jsonDireto = tentarParseJson(csvText);
  if (jsonDireto && typeof jsonDireto === 'object' && !Array.isArray(jsonDireto)) {
    return jsonDireto;
  }

  if (dadosBrutos && typeof dadosBrutos === 'object') {
    const jsonEmCampo = tentarParseJson(dadosBrutos._value || dadosBrutos.payload || dadosBrutos.json);
    if (jsonEmCampo) {
      return jsonEmCampo;
    }

    return dadosBrutos;
  }

  return null;
}

function normalizarDadosInflux(dadosBrutos) {
  if (!dadosBrutos) {
    return dadosPadrao;
  }

  return {
    temp: Number(dadosBrutos.temp) || dadosPadrao.temp,
    passos: Number(dadosBrutos.passos) || dadosPadrao.passos,
    velocidade: Number(dadosBrutos.velocidade) || dadosPadrao.velocidade,
    meta: Number(dadosBrutos.meta) || dadosPadrao.meta,
    bpm: Number(dadosBrutos.bpm) || dadosPadrao.bpm,
    sys: Number(dadosBrutos.sys) || dadosPadrao.sys,
    dia: Number(dadosBrutos.dia) || dadosPadrao.dia,
  };
}

export default function useInfluxDB() {
  const [dadosIoT, setDadosIoT] = useState(dadosPadrao);
  const [historico, setHistorico] = useState([]);
  const [ultimoAtualizado, setUltimoAtualizado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const carregarDados = useCallback(async (signal) => {
    const url = import.meta.env.VITE_INFLUX_URL;
    const org = import.meta.env.VITE_INFLUX_ORG;
    const bucket = import.meta.env.VITE_INFLUX_BUCKET;
    const token = import.meta.env.VITE_INFLUX_TOKEN;

    console.debug('[useInfluxDB] Iniciando consulta', { url, org, bucket });

    if (!url || !org || !bucket || !token) {
      console.warn('[useInfluxDB] Variáveis de ambiente do InfluxDB não configuradas corretamente.');
      setError('Configure VITE_INFLUX_URL, VITE_INFLUX_ORG, VITE_INFLUX_BUCKET e VITE_INFLUX_TOKEN.');
      setLoading(false);
      return;
    }

    const query = `from(bucket: "${bucket}")
  |> range(start: -4h)
  |> filter(fn: (r) => r._measurement == "dados_saude")
  |> last()`;

    try {
      const resposta = await fetch(`${url}/api/v2/query?org=${encodeURIComponent(org)}`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/csv',
        },
        body: JSON.stringify({
          query,
          dialect: {
            annotations: ['datatype', 'group', 'default'],
            delimiter: ',',
            header: true,
          },
        }),
        signal,
      });

      console.log('[useInfluxDB] Status da resposta do InfluxDB:', resposta.status, resposta.statusText);
      console.log('[useInfluxDB] Content-Type recebido:', resposta.headers.get('content-type'));

      if (!resposta.ok) {
        const corpoErro = await resposta.text();
        console.error('[useInfluxDB] Corpo de erro do InfluxDB:', corpoErro);
        throw new Error(`HTTP ${resposta.status} ${resposta.statusText}`);
      }

      const csv = await resposta.text();
      console.log('[useInfluxDB] Resposta bruta EXATA do InfluxDB:');
      console.log(csv);
      if (!csv.trim()) {
        console.warn('[useInfluxDB] A consulta retornou 200, mas sem conteúdo. Isso normalmente significa que a measurement nao teve pontos no intervalo ou o nome/campos nao batem.');
      }
      const registroCsv = parseInfluxCsv(csv);
      const registro = extrairRegistroUtil(registroCsv, csv) || registroCsv;
      const dadosNormalizados = normalizarDadosInflux(registro);

      console.debug('[useInfluxDB] Registro parseado', registro);
      console.debug('[useInfluxDB] Dados normalizados', dadosNormalizados);

      setDadosIoT((atual) => {
        const iguais =
          atual.temp === dadosNormalizados.temp &&
          atual.passos === dadosNormalizados.passos &&
          atual.velocidade === dadosNormalizados.velocidade &&
          atual.meta === dadosNormalizados.meta &&
          atual.bpm === dadosNormalizados.bpm &&
          atual.sys === dadosNormalizados.sys &&
          atual.dia === dadosNormalizados.dia;

        return iguais ? atual : dadosNormalizados;
      });
      setHistorico((atual) => {
        const ultimo = atual[atual.length - 1];
        const igualAoUltimo =
          ultimo &&
          ultimo.temp === dadosNormalizados.temp &&
          ultimo.passos === dadosNormalizados.passos &&
          ultimo.velocidade === dadosNormalizados.velocidade &&
          ultimo.meta === dadosNormalizados.meta &&
          ultimo.bpm === dadosNormalizados.bpm &&
          ultimo.sys === dadosNormalizados.sys &&
          ultimo.dia === dadosNormalizados.dia;

        if (igualAoUltimo) {
          return atual;
        }

        return [...atual, { ...dadosNormalizados, timestamp: new Date().toISOString() }].slice(-12);
      });
      setUltimoAtualizado(new Date().toISOString());
      console.info('[useInfluxDB] Dados do InfluxDB atualizados com sucesso.');
      setError('');
    } catch (erro) {
      if (erro.name !== 'AbortError') {
        console.error('[useInfluxDB] Erro ao consultar o InfluxDB.', erro);
        setError(erro.message || 'Erro ao consultar o InfluxDB.');
      }
    } finally {
      console.debug('[useInfluxDB] Consulta finalizada.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controlador = new AbortController();

    console.debug('[useInfluxDB] Iniciando polling de 5 segundos.');
    carregarDados(controlador.signal);
    const intervalo = window.setInterval(() => {
      console.debug('[useInfluxDB] Executando polling agendado.');
      carregarDados(controlador.signal);
    }, 5000);

    return () => {
      console.debug('[useInfluxDB] Encerrando polling e abortando requisições pendentes.');
      controlador.abort();
      window.clearInterval(intervalo);
    };
  }, [carregarDados]);

  return { dadosIoT, historico, ultimoAtualizado, loading, error, refetch: carregarDados };
}
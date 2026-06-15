# Projeto Smartwatch Care Plus - IoT & Health Tracker

## 📋 Descrição do Projeto
Este projeto consiste no desenvolvimento de um **dispositivo vestível (Smartwatch)** baseado no microcontrolador **ESP32**, projetado especificamente para a solução de saúde da **Care Plus**. O dispositivo atua na camada de *Edge Computing*, capturando, simulando e processando métricas vitais diretamente no dispositivo.

A plataforma web (desenvolvida em **React**) funciona de forma integrada ao ecossistema, atuando como o portal do usuário para o gerenciamento de sua saúde de maneira preventiva, evitando que o plano de saúde seja acionado apenas em situações críticas ou emergenciais. Através de mecânicas de gamificação com missões e recompensas, o paciente é estimulado a manter hábitos saudáveis, contando com uma página exclusiva para o monitoramento dos dados de IoT.

### 🚀 Funcionalidades Principais (Hardware & IoT):
* **Pedômetro Dinâmico:** Cálculo de passos reais baseado no tempo acumulado em velocidade de caminhada/corrida.
* **Monitoramento Térmico:** Coleta de temperatura corporal simulada via potenciômetro com precisão decimal.
* **Lógica Biométrica de Esforço:** Algoritmo dinâmico que altera os Batimentos Cardíacos (BPM) e a Pressão Arterial (Sistólica/Diastólica) de forma proporcional à velocidade de movimento, incluindo oscilações naturais geradas por ruído aleatório.
* **Interface IHM Completa:** Exibição organizada de 5 métricas vitais simultâneas (Temperatura, BPM, Pressão, Passos e Velocidade) e uma barra de progresso gráfica em tempo real no display OLED SSD1306.
* **Alertas Sonoros:** Feedback tátil (bipes curtos no pino 19) a cada passo detectado e alarme festivo (3 bipes longos) ao atingir a meta diária configurada.
* **Conectividade Segura:** Transmissão de dados via Wi-Fi encriptada para a nuvem através do broker HiveMQ Cloud.

---

## 👥 Integrantes do Grupo
* **Artur Henrique Siqueira** - RM566986
* **Davi de Souza Malta** - RM560327
* **Guilherme de Oliveira Scremin** - RM564788
* **Guilherme Cruz Alves** - RM566861
* **Pedro Sales Ferreira** - RM566910

---

## 📐 Arquitetura da Solução
A arquitetura do ecossistema é dividida em 4 camadas estruturadas:
1. **Edge Layer:** ESP32, 2 Potenciômetros (Sensores de Bancada), Display OLED SSD1306 e Buzzer (Processamento local da lógica de saúde).
2. **Communication Layer:** Protocolo MQTT sobre TLS/SSL (Porta segura 8883) via HiveMQ Cloud.
3. **Backend Layer:** Ingestão, parsing do payload JSON expandido e armazenamento (Node-RED).
4. **Application Layer:** Interface Web desenvolvida em **React** com dashboards de visualização das métricas de telemetria recebidas do banco de dados de séries temporais.

> 🔗 **Links do Projeto:**
> * **Mapeamento de Arquitetura (Miro):** [Acessar Board do Miro](https://miro.com/app/board/uXjVGzbEYKg=/?share_link_id=821501184351&focusWidget=3458764663308479839)
> * **Link demostrando funcionamento:** [Acessar Link do youtube](https://www.youtube.com/watch?v=8qEfzHyjzGI)
> * **Link da demostração no wokwwi:** [Acessar Link do wokwi](https://wokwi.com/projects/466630829410259969)
---

## 💻 Plataforma Web (Frontend em React)

O ecossistema conta com uma aplicação web robusta que gerencia o perfil e o engajamento do usuário.

### 🔐 Sistema de Autenticação e Credenciais
A aplicação possui uma verificação estrita de login que bloqueia a navegação pelas rotas sem autenticação prévia. Para fins de testes, utilize os seguintes dados de acesso:

* **Carteirinha:** 8472A91B5C03 | **Senha:** senha123
* **Carteirinha:** A91C7D3F5B28 | **Senha:** alpha789
* **Carteirinha:** F3B82A7D91CE | **Senha:** beta456
* **Carteirinha:** 9D1A7C3E5B62 | **Senha:** gamma321

### 📂 Estrutura de Páginas da Aplicação
Após efetuar o login, o usuário ganha acesso ao menu principal contendo as seguintes visões:

* **Home:** Apresenta um panorama geral com missões não iniciadas e a média de conclusão das tarefas do usuário.
* **Missões:** Lista as metas de saúde pendentes armazenadas estruturalmente em formato de array (preparado para futura integração com endpoints JSON de API).
* **Perfil:** Exibe as informações cadastrais consolidadas do paciente (Nome completo, Altura, Peso, Comorbidades/Deficiências, Data de Nascimento e Foto de Perfil).
* **Recompensas:** Integração funcional com `LocalStorage` para permitir o resgate de prêmios utilizando os pontos acumulados nas metas cumpridas.

### 🌐 A Página "Informações" (Foco em IoT)
Esta é a **página central da disciplina de IoT**. É nesta view que ocorre a convergência entre o hardware e o software da aplicação. 
* **Função:** Atua como o painel de telemetria e dashboard em tempo real da aplicação web.
* **Métricas Exibidas:** Consome e renderiza os dados históricos e instantâneos enviados pelo Smartwatch via backend (Temperatura, Batimentos Cardíacos (BPM), Pressão Sistólica/Diastólica e Passos Totais).
* **Objetivo:** Permitir tanto ao paciente quanto à equipe médica credenciada o acompanhamento visual imediato do progresso biológico e o monitoramento preventivo de anomalias detectadas pelo ESP32.

### 🔧 Como iniciar a plataforma de front-end

1. Navegar até a pasta do frontend

    Antes de executar qualquer comando, você precisa entrar na pasta onde o projeto React está localizado:

    ```bash
    cd frontend

    ```

2. Instalar as dependências do projeto

   ```bash
   npm install

   ```

3. Iniciar o servidor de desenvolvimento

   ```bash
   npm start

    ```

## 🔧 Instruções de Uso e Configuração de Hardware

### Pré-requisitos
* Acesso ao simulador [Wokwi](https://wokwi.com/) ou uma placa física ESP32 com a Arduino IDE configurada.
* Bibliotecas instaladas no ambiente:
    * `PubSubClient`
    * `Adafruit SSD1306`
    * `Adafruit GFX Library`
    * `Wire` (Inclusa nativamente)

### 🔌 Pinagem e Montagem de Bancada
Faça as conexões no simulador ou circuito físico conforme a tabela abaixo:

| Componente | Pino ESP32 | Tipo de Sinal / Função |
| :--- | :--- | :--- |
| **Potenciômetro 1 (Temperatura)** | **GPIO 34** | Entrada Analógica (ADC) |
| **Potenciômetro 2 (Velocidade)** | **GPIO 35** | Entrada Analógica (ADC) |
| **Buzzer Ativo/Passivo** | **GPIO 19** | Saída Digital (Feedback sonoro) |
| **Display OLED (SDA)** | **GPIO 21** | Comunicação I2C Data |
| **Display OLED (SCL)** | **GPIO 22** | Comunicação I2C Clock |

---

## 🚀 Execução e Testes do Sistema

### 1. Configuração do Firmware (ESP32)
O código fonte do dispositivo já está pré-configurado com os seguintes parâmetros de conexão para testes:
* **Rede Wi-Fi:** `Wokwi-GUEST` (Sem senha)
* **Broker MQTT:** `HiveMQ Cloud` na Porta `8883`
* **Tópico de Envio:** `wokwi/projeto/sensores`

### 2. Payload de Saída (JSON)
A cada **5 segundos**, o ESP32 monta e transmite um pacote contendo todas as variáveis coletadas e calculadas. O formato final do JSON bruto enviado é o seguinte:

{"temp":36.5,"passos":12,"velocidade":6.8,"meta":100,"bpm":127,"sys":133,"dia":85}

### 3. Como Testar a Simulação Dinâmica de Saúde
1. Inicie a simulação no Wokwi. O display exibirá temporariamente a mensagem de inicialização `Care Plus OS...`.
2. **Ajuste de Temperatura:** Mova o slider do **Potenciômetro 1 (GPIO 34)**. O valor será mapeado dinamicamente entre **35.0°C e 42.0°C** no display.
3. **Ajuste de Velocidade e Esforço:** Mova o slider do **Potenciômetro 2 (GPIO 35)** (Mapeado de **0 a 15 km/h**).
   * **Em Repouso (Abaixo de 1.5 km/h):** O velocímetro zera, e o algoritmo estabiliza os Batimentos e a Pressão em valores basais normais (BPM ~70, Pressão ~120/80) variando levemente por ruído natural.
   * **Em Movimento (Acima de 1.5 km/h):** O algoritmo entra em modo de esforço. O contador de passos começará a subir proporcionalmente à velocidade configurada. **O BPM e a Pressão Arterial subirão automaticamente** para simular a resposta cardiovascular ao exercício físico.
4. **Meta de Passos:** Ao atingir a marca de **100 passos**, o display exibirá `META ATINGIDA! :)` e o Buzzer tocará um alarme de 3 bipes longos em sequência.

---

## ⚙️ Configuração do Backend (Node-RED)

O fluxo do Node-RED é responsável por receber os dados do broker MQTT, tratá-los e persistir as informações em um banco de dados de séries temporais (InfluxDB).

### Pré-requisitos no Node-RED
Antes de importar o fluxo, certifique-se de instalar a biblioteca do banco de dados no Node-RED através do menu **Manage Palette** ou via terminal dentro do diretório de instalação executando o comando bash: npm install node-red-contrib-influxdb

### Como Importar o Fluxo
1. Copie o código JSON do fluxo do Node-RED fornecido no repositório.
2. No Node-RED, clique no menu superior direito (ícone de três linhas).
3. Selecione **Import** e cole o JSON no campo de texto.

### Componentes e Nós Utilizados
* **HiveMQ In (MQTT In):** Se conecta ao servidor em nuvem da HiveMQ (`c681ba6c58ed47f4a65231a0cf5faaac.s1.eu.hivemq.cloud`) na porta segura `8883` com suporte a TLS ativo. Ele está configurado com o usuário `artur_hs` para escutar as mensagens publicadas pelos dispositivos.
* **json (JSON Node):** Converte a string pura recebida do MQTT em um objeto JavaScript manipulável para que as propriedades do payload fique prontas para a inserção no banco.
* **debug 2 (Debug Node):** Exibe o conteúdo processado na aba lateral de depuração do Node-RED, facilitando o monitoramento e a validação do fluxo durante a execução.
* **Banco de dados (InfluxDB Out):** Realiza a inserção dos dados estruturados na tabela/measurement `dados_saude` dentro da nuvem do InfluxDB (AWS Cloud us-east-1). Ele está vinculado à organização `arturhs2019@gmail.com` no bucket designado `CarePlus_Dados`.

### Ativação do Fluxo
Após importar e validar as credenciais secretas do MQTT e do InfluxDB (Tokens de autenticação), clique no botão **Deploy** no canto superior direito para iniciar a execução e o armazenamento dos dados de saúde em tempo real, que ficarão disponíveis para renderização na página de **Informações** do Frontend React.

---
*Projeto desenvolvido para a disciplina de IoT - Global Solution 2026.*
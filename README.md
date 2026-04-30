# Projeto Smartwatch Care Plus - IoT & Health Tracker

## Descrição do Projeto
Este projeto consiste no desenvolvimento de um **dispositivo vestível (Smartwatch)** baseado no microcontrolador **ESP32**, projetado especificamente para a solução de saúde da **Care Plus**. O dispositivo atua na camada de *Edge Computing*, capturando métricas vitais diretamente do usuário.

A solução utiliza o protocolo **MQTT** com camadas de segurança **TLS/SSL** (Porta 8883) para enviar os dados em tempo real para um Broker (HiveMQ Cloud). No destino, os dados são processados para monitoramento preventivo, permitindo que a equipe médica acompanhe o progresso de metas e receba alertas sobre anomalias.

### Funcionalidades Principais:
*   **Pedômetro Inteligente:** Cálculo de passos e velocidade baseado na magnitude do acelerômetro (MPU6050).
*   **Monitoramento Térmico:** Leitura de temperatura corporal via sensor integrado ao MPU6050.
*   **Interface IHM:** Exibição de métricas (passos, velocidade, temperatura) e barra de progresso em tempo real no display OLED SSD1306.
*   **Alertas Sonoros:** Feedback tátil (bipes curtos) a cada passo detectado e alarme festivo ao atingir a meta diária.
*   **Conectividade Segura:** Transmissão de dados via Wi-Fi criptografado para proteção de informações sensíveis.

## Integrantes
- **Artur Henrique Siqueira** - RM566986
- **Davi de Souza Malta** - RM560327
- **Guilherme de Oliveira Scremin** - RM564788
- **Guilherme cruz alves** - RM566861
- **Pedro Sales Ferreira** - RM566990

## Arquitetura da Solução
O projeto segue o modelo de arquitetura em camadas:
1.  **Edge Layer:** ESP32, MPU6050, Display OLED e Buzzer (Processamento local).
2.  **Communication Layer:** Protocolo MQTT sobre TLS/SSL via HiveMQ Cloud.
3.  **Backend Layer:** Ingestão e parsing de JSON (Node-RED) e armazenamento.
4.  **Application Layer:** Dashboards de visualização para médicos e pacientes.

Link miro: https://miro.com/app/board/uXjVGzbEYKg=/?share_link_id=821501184351&focusWidget=3458764663308479839

## Instruções de Uso

### Pré-requisitos
*   Acesso ao simulador [Wokwi](https://wokwi.com/).
*   Bibliotecas necessárias (inclusas no ambiente Wokwi ou via Library Manager no Arduino IDE):
    *   `PubSubClient`
    *   `Adafruit MPU6050`
    *   `Adafruit SSD1306`
    *   `Adafruit GFX Library`

### Configuração e Execução
1.  **Montagem do Hardware:** No simulador, certifique-se das seguintes conexões:
    *   **MPU6050 & OLED:** SDA no pino **21** e SCL no pino **22**.
    *   **Buzzer:** Terminal positivo no pino **14** e negativo no **GND**.
2.  **Configuração de Software:** O código fonte utiliza a rede `Wokwi-GUEST` e um broker HiveMQ configurado com as credenciais do grupo.
3.  **Execução:**
    *   Inicie a simulação no Wokwi.
    *   O display exibirá "Care Plus OS..." e iniciará a leitura.
    *   **Simular Passos:** Clique no sensor MPU6050 e mova os sliders de aceleração rapidamente. Cada pico acima de 13.0 contará como um passo.
    *   **Simular Temperatura:** Altere o slider de temperatura no componente MPU6050 para ver a atualização no display e o envio via MQTT.
4.  **Monitoramento:** Verifique as mensagens JSON enviadas no Serial Monitor a cada 5 segundos.

---
*Projeto desenvolvido para a disciplina de IoT - Global Solution 2026.*
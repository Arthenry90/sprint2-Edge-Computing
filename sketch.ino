// --- Identificação do Grupo ---
// Artur Henrique Siqueira - RM566986 | Davi de Souza Malta - RM560327
// Guilherme cruz alves - RM566861     | Pedro Sales Ferreira - RM566910
// Guilherme de Oliveira Scremin - RM564788

#include <PubSubClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- Configurações de Hardware e Pinos ---
#define BUZZER_PIN      19 
#define PIN_POT_TEMP    34  // Potenciômetro para Temperatura
#define PIN_POT_VEL     35  // Potenciômetro para Velocidade
#define SERIAL_BAUD     115200

// --- Configurações do Display OLED ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

// --- Variáveis de Saúde e Metas ---
const int META_PASSOS = 100; 
int passosTotais = 0;
float velocidadeAtual = 0.0;
float temperaturaCorporal = 0.0;
bool metaNotificada = false;

int batimentosCardiacos = 70;
int pressaoSistolica = 120;
int pressaoDiastolica = 80;

// --- Constantes de Controle ---
const unsigned long INTERVALO_ENVIO_MQTT = 5000; 
unsigned long tempoMQTT = 0;
unsigned long tempoLeitura = 0;
unsigned long acumuladorTempoPasso = 0;

// --- Objetos e Instâncias ---
WiFiClientSecure espClient;
PubSubClient client(espClient);

// --- Credenciais MQTT ---
const char* ssid        = "Wokwi-GUEST";
const char* password    = "";
const char* mqtt_server = "c681ba6c58ed47f4a65231a0cf5faaac.s1.eu.hivemq.cloud";
const int   mqtt_port   = 8883;
const char* mqtt_user   = "artur_hs";
const char* mqtt_pass   = "Fiap12345";
const char* mqtt_topic  = "wokwi/projeto/sensores";

void setup() {
  Serial.begin(SERIAL_BAUD);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(PIN_POT_TEMP, INPUT);
  pinMode(PIN_POT_VEL, INPUT);

  if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("Falha no OLED");
  } else {
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setTextSize(1);
    display.setCursor(10, 25);
    display.println("Care Plus OS...");
    display.display();
  }
  
  conectarWiFi();
  espClient.setInsecure(); 
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWiFi();
  if (!client.connected()) conectarMQTT();
  client.loop();
  
  // Leitura dos sensores e atualização do display a cada 200ms
  if (millis() - tempoLeitura >= 200) {
    unsigned long deltaTempo = millis() - tempoLeitura;
    tempoLeitura = millis();
    
    processarLeituras(deltaTempo);
    atualizarDisplayOLED(); 
  }

  // Envio MQTT
  if (millis() - tempoMQTT >= INTERVALO_ENVIO_MQTT) {
    tempoMQTT = millis();
    enviarDadosMQTT();
  }
}

void processarLeituras(unsigned long delta) {
  // Mapeia Potenciômetro 1 para Temperatura (35°C a 42°C)
  int leituraTemp = analogRead(PIN_POT_TEMP);
  temperaturaCorporal = 35.0 + (leituraTemp * (42.0 - 35.0) / 4095.0);

  // Mapeia Potenciômetro 2 para Velocidade (0 a 15 km/h)
  int leituraVel = analogRead(PIN_POT_VEL);
  velocidadeAtual = (leituraVel * 15.0) / 4095.0;

  // LÓGICA DINÂMICA: Altera batimentos e pressão com base na velocidade
  if (velocidadeAtual > 1.5) { 
    acumuladorTempoPasso += delta;
    
    // Simula esforço físico: batimentos variam entre 110 e 160 bpm na corrida (+ oscilação aleatória)
    batimentosCardiacos = 100 + (velocidadeAtual * 4) + random(-3, 4);
    pressaoSistolica = 120 + (velocidadeAtual * 2) + random(-2, 3);
    pressaoDiastolica = 80 + (velocidadeAtual * 0.8) + random(-1, 2);

    float metrosPorMilisegundo = (velocidadeAtual / 3.6) / 1000.0;
    float distanciaPercorrida = metrosPorMilisegundo * acumuladorTempoPasso;

    if (distanciaPercorrida >= 0.75) { 
      passosTotais++;
      acumuladorTempoPasso = 0; 
      
      // Bipa no passo
      digitalWrite(BUZZER_PIN, HIGH);
      delay(15); 
      digitalWrite(BUZZER_PIN, LOW);

      // Alarme da meta
      if (passosTotais >= META_PASSOS && !metaNotificada) {
        metaNotificada = true;
        for(int i=0; i<3; i++) {
          digitalWrite(BUZZER_PIN, HIGH); delay(100);
          digitalWrite(BUZZER_PIN, LOW);  delay(100);
        }
      }
    }
  } else {
    acumuladorTempoPasso = 0; 
    velocidadeAtual = 0.0;
    
    // Usuário em repouso: batimentos e pressão voltam ao normal estável
    batimentosCardiacos = 70 + random(-2, 3);
    pressaoSistolica = 120 + random(-3, 4);
    pressaoDiastolica = 80 + random(-2, 3);
  }
}

void atualizarDisplayOLED() {
  display.clearDisplay();
  display.setTextSize(1);
  
  // Linha 1: Temperatura e Batimentos
  display.setCursor(0, 0);
  display.print("Temp: "); display.print(temperaturaCorporal, 1); display.print("C");
  display.setCursor(70, 0);
  display.print("BPM: "); display.print(batimentosCardiacos);

  // Linha 2: Pressão Arterial
  display.setCursor(0, 13);
  display.print("Pressao: "); display.print(pressaoSistolica); display.print("/"); display.print(pressaoDiastolica);

  // Linha 3: Passos
  display.setCursor(0, 26);
  display.print("Passos: "); display.print(passosTotais); display.print(" / "); display.print(META_PASSOS);

  // Linha 4: Velocidade
  display.setCursor(0, 39);
  display.print("Velocid: "); display.print(velocidadeAtual, 1); display.print(" km/h");

  if (passosTotais >= META_PASSOS) {
    display.setCursor(0, 49);
    display.print("META ATINGIDA! :)");
  }

  // Barra de progresso rebaixada um pouco para caber tudo
  display.drawRect(0, 58, 128, 6, WHITE); 
  int progresso = (passosTotais * 128) / META_PASSOS;
  if (progresso > 128) progresso = 128; 
  display.fillRect(0, 58, progresso, 6, WHITE); 

  display.display();
}

void enviarDadosMQTT() {
  char buffer[160]; // Aumentado o tamanho para acomodar os novos dados
  
  // Incluídos os novos campos "bpm", "sys" e "dia" no JSON
  snprintf(buffer, sizeof(buffer), 
    "{\"temp\":%.1f,\"passos\":%d,\"velocidade\":%.1f,\"meta\":%d,\"bpm\":%d,\"sys\":%d,\"dia\":%d}", 
    temperaturaCorporal, passosTotais, velocidadeAtual, META_PASSOS, batimentosCardiacos, pressaoSistolica, pressaoDiastolica);
  
  bool statusEnvio = client.publish(mqtt_topic, buffer);
  
  if (statusEnvio) {
    Serial.print("[MQTT] Sucesso ao enviar: ");
    Serial.println(buffer);
  } else {
    Serial.println("[MQTT] FALHA no envio! Verifique a conexao com o Broker.");
  }
}

void conectarWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) delay(500);
}

void conectarMQTT() {
  while (!client.connected()) {
    String clientId = "ESP32-Watch-" + String(random(0xffff), HEX);
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) return;
    delay(2000);
  }
}
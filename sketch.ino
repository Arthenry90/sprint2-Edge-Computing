// --- Identificação do Grupo ---
// Artur Henrique Siqueira - RM566986 | Davi de Souza Malta - RM560327
// Guilherme cruz alves - RM566861     | Pedro Sales Ferreira - RM566910

#include <PubSubClient.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

// --- Configurações de Hardware e Pinos ---
#define BUZZER_PIN      19 
#define SERIAL_BAUD     115200

// --- Configurações do Display OLED ---
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET    -1 
#define ENDERECO_OLED 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

// --- Variáveis de Saúde e Metas ---
const int META_PASSOS = 10; 
int passosTotais = 0;
float velocidadeAtual = 0.0;
float temperaturaCorporal = 0.0;
const float TAMANHO_PASSO_METROS = 0.75; 
bool metaNotificada = false; // Garante que o alarme da meta toque apenas uma vez

// --- Constantes de Controle ---
const float LIMITE_PISADA = 13.0; 
const unsigned long INTERVALO_ENVIO_MQTT = 5000; 

// --- Objetos e Instâncias ---
Adafruit_MPU6050 mpu;
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

// --- Protótipos de Funções ---
void conectarWiFi();
void conectarMQTT();
void calcularPassosEVelocidade();
void enviarDadosMQTT();
void atualizarDisplayOLED(float temp);
void emitirSomPasso();
void emitirSomMeta();

void setup() {
  Serial.begin(SERIAL_BAUD);
  Wire.begin();
  pinMode(BUZZER_PIN, OUTPUT);

  if(!display.begin(SSD1306_SWITCHCAPVCC, ENDERECO_OLED)) {
    Serial.println("Falha no OLED");
  } else {
    display.clearDisplay();
    display.setTextColor(WHITE);
    display.setTextSize(1);
    display.setCursor(10, 25);
    display.println("Care Plus OS...");
    display.display();
  }
  
  if (!mpu.begin()) Serial.println("Falha no MPU6050!");

  conectarWiFi();
  espClient.setInsecure(); 
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) conectarWiFi();
  if (!client.connected()) conectarMQTT();
  client.loop();
  
  static unsigned long tempoPassos = 0;
  if (millis() - tempoPassos >= 100) {
    tempoPassos = millis();
    calcularPassosEVelocidade(); 
    atualizarDisplayOLED(temperaturaCorporal); 
  }

  static unsigned long tempoMQTT = 0;
  if (millis() - tempoMQTT >= INTERVALO_ENVIO_MQTT) {
    tempoMQTT = millis();
    enviarDadosMQTT();
  }
}

void calcularPassosEVelocidade() {
  sensors_event_t a, g, t;
  mpu.getEvent(&a, &g, &t);
  temperaturaCorporal = t.temperature;

  float magnitude = sqrt(sq(a.acceleration.x) + sq(a.acceleration.y) + sq(a.acceleration.z));
  static bool emPasso = false;
  static unsigned long tempoUltimoPasso = 0;

  if (magnitude > LIMITE_PISADA && !emPasso) {
    emPasso = true;
    passosTotais++;
    emitirSomPasso(); // Bipa a cada passo
    
    unsigned long tempoDecorrido = millis() - tempoUltimoPasso;
    if (tempoDecorrido > 0) {
      float velMetrosPorSegundo = TAMANHO_PASSO_METROS / (tempoDecorrido / 1000.0);
      velocidadeAtual = velMetrosPorSegundo * 3.6; 
    }
    tempoUltimoPasso = millis();

    // Verifica se bateu a meta agora
    if (passosTotais >= META_PASSOS && !metaNotificada) {
      emitirSomMeta();
      metaNotificada = true;
    }
  } 
  else if (magnitude < LIMITE_PISADA - 2.0) {
    emPasso = false;
  }

  if (millis() - tempoUltimoPasso > 2000) {
    velocidadeAtual = 0.0;
  }
}

void atualizarDisplayOLED(float temp) {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(0, 0);
  display.print("Temp. Corp: ");
  display.print(temp, 1);
  display.print(" C");

  display.setCursor(0, 16);
  display.print("Passos: ");
  display.print(passosTotais);
  display.print(" / ");
  display.print(META_PASSOS);

  display.setCursor(0, 32);
  display.print("Velocid.: ");
  display.print(velocidadeAtual, 1);
  display.print(" km/h");

  if (passosTotais >= META_PASSOS) {
    display.setCursor(0, 44);
    display.print("META ATINGIDA! :)");
  }

  display.drawRect(0, 54, 128, 10, WHITE); 
  int progresso = (passosTotais * 128) / META_PASSOS;
  if (progresso > 128) progresso = 128; 
  display.fillRect(0, 54, progresso, 10, WHITE); 

  display.display();
}

// --- Funções de Som ---
void emitirSomPasso() {
  digitalWrite(BUZZER_PIN, HIGH);
  delay(20); // Bipe bem curto (estalo)
  digitalWrite(BUZZER_PIN, LOW);
}

void emitirSomMeta() {
  for(int i=0; i<3; i++) {
    digitalWrite(BUZZER_PIN, HIGH);
    delay(200);
    digitalWrite(BUZZER_PIN, LOW);
    delay(100);
  }
}

void enviarDadosMQTT() {
  char buffer[256];
  snprintf(buffer, sizeof(buffer), 
    "{\"temp\":%.2f,\"passos\":%d,\"velocidade\":%.2f,\"meta\":%d}", 
    temperaturaCorporal, passosTotais, velocidadeAtual, META_PASSOS);
  client.publish(mqtt_topic, buffer);
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
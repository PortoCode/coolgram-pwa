# Coolgram

Coolgram é uma Progressive Web App (PWA) desenvolvida para testar e demonstrar recursos como caching, push notifications, uso de câmera, captação de geolocalização e instalação do app.

## Funcionalidades

- **Caching**: Testa o cache de recursos e dados para melhorar a performance e a experiência offline.
- **Push Notifications**: Implementa e gerencia notificações push para engajar os usuários.
- **Uso de Câmera**: Integração com a câmera do dispositivo para capturar fotos e vídeos.
- **Captação de Geolocalização**: Acesso à localização do usuário para personalização e funcionalidades baseadas em localização.
- **Instalação do App**: Permite que os usuários instalem a PWA no dispositivo para acesso rápido e offline.

## Requisitos

- [Node.js](https://nodejs.org/) - Ambiente de execução JavaScript
- [json-server](https://github.com/typicode/json-server) - Simulador de back-end

## Instruções de Instalação

1. **Clone o repositório:**

   ```bash
   git clone https://github.com/PortoCode/coolgram-pwa.git
   ```

2. **Navegue até o diretório do projeto:**

   ```bash
   cd coolgram
   ```

3. **Instale as dependências do projeto:**

   ```bash
   npm install
   ```

4. **Instale o json-server globalmente se ainda não o fez:**

   ```bash
   npm install -g json-server
   ```

## Instruções de Execução

1. **Inicie o servidor que simula o back-end:**

   ```bash
   json-server --watch db.json
   ```

2. **Inicie o front-end da PWA:**

   ```bash
   npm start
   ```

3. **Abra seu navegador e acesse http://localhost:8080 para ver a aplicação em ação.**

   ```bash
   npm install
   ```
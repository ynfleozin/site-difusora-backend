# API de Notícias e Cotações - Rádio Difusora

Este é o projeto de backend para o site da Rádio Difusora Colatina. Sua principal responsabilidade é atuar como uma API centralizada que busca, processa, armazena em cache e serve dados de notícias e cotações de moedas para o frontend.

## Funcionalidades

- **Agregação de Notícias:** Realiza web scraping de múltiplas fontes de notícias (Agência Câmara e Agência Brasil) para criar um feed unificado.
- **API de Cotações:** Busca cotações de moedas (Dólar, Euro, Bitcoin, Ethereum) em tempo real.
- **Processamento de Dados:** Limpa o HTML das notícias, extrai metadados como autor e categoria, e formata os dados para consumo fácil.
- **Sistema de Cache:** Implementa um cache em arquivo para minimizar requisições a fontes externas, garantindo alta performance e confiabilidade.
- **API RESTful:** Expõe os dados através de endpoints bem definidos e fáceis de usar.

## Tecnologias Utilizadas

- **Node.js:** Ambiente de execução JavaScript no servidor.
- **TypeScript:** Superset do JavaScript que adiciona tipagem estática.
- **Express.js:** Framework para criação do servidor e das rotas da API.
- **Axios:** Cliente HTTP para fazer requisições às fontes de dados.
- **Cheerio:** Biblioteca para manipulação e parsing de HTML no servidor (web scraping).
- **rss-parser:** Biblioteca para parsing de feeds RSS.
- **CORS:** Middleware para habilitar o compartilhamento de recursos entre origens diferentes (frontend e backend).
- **Dotenv:** Para gerenciamento de variáveis de ambiente.

## Instalação e Configuração

Siga os passos abaixo para rodar o projeto localmente.

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18.0.0 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-seu-repositorio>
    cd site-difusora-backend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    Crie um arquivo chamado `.env` na raiz do projeto. Você pode copiar o arquivo de exemplo `.env.example` (se ele existir) ou criar um do zero.

    **Arquivo `.env`:**
    ```
    # Porta em que o servidor da API irá rodar
    PORT=3001
    ```

## 📜 Scripts Disponíveis

No diretório do projeto, você pode rodar os seguintes comandos:

### `npm run dev`
Inicia o servidor em modo de desenvolvimento usando `ts-node-dev`. O servidor reiniciará automaticamente a cada alteração nos arquivos.

### `npm run build`
Compila o código TypeScript da pasta `src` para JavaScript puro na pasta `dist`. Este comando é usado para preparar o projeto para produção.

### `npm run start`
Inicia o servidor a partir dos arquivos compilados na pasta `dist`. Este é o comando para rodar a aplicação em um ambiente de produção.

## ⚙️ Estrutura da API (Endpoints)

A API expõe os seguintes endpoints:

---
### 1. Notícias

- **`GET /api/news`**
  - **Descrição:** Retorna uma lista agregada e ordenada por data das notícias mais recentes de todas as fontes.
  - **Resposta de Sucesso (200 OK):**
    ```json
    [
      {
        "title": "Título da Notícia",
        "contentHTML": "<p>Conteúdo da notícia em HTML...</p>",
        "sourceUrl": "https://.../link-original",
        "sourceName": "Agência Brasil",
        "publishedAt": "2025-06-30T18:30:00.000Z",
        "imageUrl": "https://.../imagem.jpg",
        "author": "Nome do Autor",
        "category": "Política",
        "slug": "titulo-da-noticia"
      }
    ]
    ```

- **`GET /api/news/:slug`**
  - **Descrição:** Retorna um único objeto de notícia que corresponde ao `slug` (ID baseado no título) fornecido.
  - **Parâmetros:**
    - `slug` (string): O ID único da notícia.
  - **Resposta de Sucesso (200 OK):** Um único objeto de notícia.
  - **Resposta de Erro (404 Not Found):**
    ```json
    {
      "message": "Notícia não encontrada"
    }
    ```

---
### 2. Cotações de Moedas

- **`GET /api/currencies`**
  - **Descrição:** Retorna as cotações atuais para Dólar, Euro, Bitcoin e Ethereum em relação ao Real.
  - **Resposta de Sucesso (200 OK):**
    ```json
    {
      "USDBRL": {
        "code": "USD",
        "name": "Dólar Americano/Real Brasileiro",
        "bid": "5.4394",
        "..." : "..."
      },
      "EURBRL": { "...": "..." },
      "BTCBRL": { "...": "..." },
      "ETHBRL": { "...": "..." }
    }
    ```

## 🗄️ Lógica de Cache

Para otimizar a performance e reduzir o número de requisições às fontes externas, a aplicação utiliza um sistema de cache baseado em arquivos:
- As **notícias** são cacheadas por **1 hora** (3600 segundos) no arquivo `news-cache.json`.
- As **cotações de moedas** são cacheadas por **5 minutos** (300 segundos) no arquivo `currencies-cache.json`.

Esses arquivos são criados automaticamente na raiz do projeto e devem ser adicionados ao `.gitignore` para não serem versionados. Para um ambiente de produção (deploy), recomenda-se substituir este cache por um serviço em memória como o **Redis**.

## 📜 Licença

Este projeto está licenciado sob a licença ISC.
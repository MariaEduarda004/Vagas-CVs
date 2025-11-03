# Vagas e CVs

Sistema para cadastrar vagas e CVs, e realizar matching inteligente por skills e filtros (UF, cidade, senioridade, tipo de contrato).

**Backend** em Node.js/Express integrado com **Elasticsearch** para busca avançada.  
**Frontend** em HTML + Bootstrap para interface simples e responsiva.

Este projeto foi desenvolvido para a disciplina de **Tópicos Especiais em BackEnd II**

## Tecnologias Utilizadas

- **Node.js** 20.x LTS
- **Express** - Framework web
- **@elastic/elasticsearch** - Cliente oficial
- **Elasticsearch 8.x** - Motor de busca (via Docker)
- **Docker/Docker Compose** - Containerização
- **Bootstrap 5** - Framework CSS (CDN)
- **HTML/JavaScript** - Frontend puro

## Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker Desktop** (rodando)
- **Node.js 18+** (recomendado: 20.x LTS)
- **Git**

## Como Rodar Localmente

### Clonar o repositório

```bash
git clone https://github.com/MariaEduarda004/Vagas-CVs.git
cd vagas-cvs
```

### Criar o arquivo `.env`

```env
PORT=3001
ELASTIC_URL=http://localhost:9200
JOBS_INDEX=jobs
CVS_INDEX=cvs
```

### Subir o Elasticsearch (Docker)

Certifique-se de que o **Docker Desktop** está aberto e execute:

```bash
docker compose up -d
```

### Instalar dependências

```bash
npm install
```

### Criar os índices no Elasticsearch

```bash
npm run setup
```

> Isso cria os índices `jobs` e `cvs` no Elasticsearch (se não existirem)

### Rodar a API em modo desenvolvimento

```bash
npm run dev
```
**A API estará disponível em:** `http://localhost:3001`

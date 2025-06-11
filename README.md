# Aplicativo de Denúncias Ambientais

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-yellow)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)

## 📋 Sobre o Projeto

O Aplicativo de Denúncias Ambientais é uma plataforma web que permite aos cidadãos reportar problemas ambientais em sua cidade, como queimadas, desmatamento, despejo irregular de lixo, entre outros. O sistema permite denúncias anônimas ou identificadas e apresenta os dados em um mapa interativo.

## 🌟 Funcionalidades

- **Denúncias Anônimas**: Opção de registrar denúncias sem identificação ou fornecendo nome/email
- **Localização Automática**: Captura de coordenadas GPS ou inserção manual
- **Upload de Fotos**: Anexar até 2 imagens da ocorrência
- **Categorização**: Seleção do tipo de problema ambiental
- **Registro de Data/Hora**: Captura automática com opção de edição manual
- **Mapa Interativo**: Visualização georreferenciada das denúncias
- **Relatórios Administrativos**: Geração de relatórios em CSV/PDF e visualizações gráficas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: React.js com Next.js
- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB
- **Armazenamento de Imagens**: Firebase Storage
- **Mapas**: Leaflet com OpenStreetMap

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js (v14+)
- npm ou yarn
- MongoDB

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/app-denuncias-ambientais.git
cd app-denuncias-ambientais
```

2. Instale as dependências do frontend
```bash
cd client
npm install
```

3. Instale as dependências do backend
```bash
cd ../server
npm install
```

4. Configure as variáveis de ambiente
   - Crie um arquivo `.env` na pasta `server` baseado no `.env.example`
   - Crie um arquivo `.env.local` na pasta `client` baseado no `.env.example`

5. Inicie o servidor de desenvolvimento
```bash
# No diretório server
npm run dev

# Em outro terminal, no diretório client
npm run dev
```

## 📊 Status de Implementação

| Feature | Status |
|---------|--------|
| Configuração Inicial | ✅ Em andamento |
| Denúncias Anônimas | ⏳ Pendente |
| Localização Automática | ⏳ Pendente |
| Upload de Fotos | ⏳ Pendente |
| Categorias de Denúncia | ⏳ Pendente |
| Mapa Interativo | ⏳ Pendente |
| Relatórios Administrativos | ⏳ Pendente |

## 📁 Estrutura do Projeto

```
projeto-denuncias-ambientais/
├── client/                      # Frontend React
│   ├── public/                  # Arquivos estáticos
│   ├── src/
│   │   ├── components/          # Componentes reutilizáveis
│   │   ├── pages/               # Páginas da aplicação
│   │   ├── contexts/            # Contextos React
│   │   ├── services/            # Serviços de API
│   │   └── utils/               # Funções utilitárias
│   └── package.json
│
├── server/                      # Backend Node.js
│   ├── controllers/             # Controladores de rotas
│   ├── models/                  # Modelos do banco de dados
│   ├── routes/                  # Definição de rotas da API
│   ├── middleware/              # Middlewares
│   ├── services/                # Serviços (email, storage, etc)
│   ├── config/                  # Configurações
│   └── package.json
│
├── windsurfrules.json           # Regras do projeto
├── project_memory.md            # Memória do projeto
├── tasks.json                   # Tarefas de desenvolvimento
└── README.md                    # Documentação do projeto
```

## 🔄 Atualizações

### Versão 1.0.0 (11/06/2025)
- Configuração inicial do projeto
- Definição da arquitetura
- Criação de arquivos de configuração e documentação

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

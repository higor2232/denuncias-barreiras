# Aplicativo de Denúncias Ambientais

![Status do Projeto](https://img.shields.io/badge/Status-Funcional-green)
![Versão](https://img.shields.io/badge/Versão-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15.3-black)
![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Storage-orange)

## 📋 Sobre o Projeto

Plataforma web cidadã para registro de denúncias ambientais. Permite que cidadãos reportem problemas como queimadas, desmatamento, despejo irregular de lixo, entre outros. O sistema aceita denúncias anônimas ou identificadas e apresenta os dados em um mapa interativo.

## 🌟 Funcionalidades Implementadas

- ✅ **Denúncias Anônimas/Identificadas**: Escolha entre registro anônimo ou com nome/email
- ✅ **Localização GPS**: Captura automática de coordenadas ou inserção manual
- ✅ **Upload de Fotos**: Até 2 imagens com compressão automática (máx. 5MB cada)
- ✅ **Captura de Câmera**: Tire fotos diretamente pelo navegador
- ✅ **Categorização Dinâmica**: Categorias gerenciadas via Firestore
- ✅ **Registro de Data/Hora**: Automático ou manual
- ✅ **Mapa Interativo**: Visualização com Leaflet/OpenStreetMap
- ✅ **Painel Administrativo**: Dashboard com filtros, paginação e exportação
- ✅ **Relatórios**: Exportação em CSV e PDF com filtros

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 15.3 + React 19 + TypeScript |
| **Estilização** | TailwindCSS 4 |
| **Banco de Dados** | Firebase Firestore |
| **Armazenamento** | Firebase Storage |
| **Autenticação** | Firebase Auth |
| **Mapas** | Leaflet + OpenStreetMap |
| **PDF** | @react-pdf/renderer |

## 🚀 Instalação e Uso

### Pré-requisitos
- Node.js (v18+)
- npm ou yarn
- Projeto Firebase configurado

### Instalação

1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/app-denuncias-ambientais.git
cd app-denuncias-ambientais
```

2. Instale as dependências
```bash
cd frontend
npm install
```

3. Configure o Firebase
   - Crie um projeto no [Firebase Console](https://console.firebase.google.com)
   - Ative Firestore, Storage e Authentication
   - Copie as credenciais para `src/firebase/config.ts`

4. Inicie o servidor de desenvolvimento
```bash
npm run dev
```

5. Acesse `http://localhost:3000`

## 📁 Estrutura do Projeto

```
projeto-denuncias-ambientais/
├── frontend/                    # Aplicação Next.js
│   ├── src/
│   │   ├── app/                 # Rotas (App Router)
│   │   │   ├── page.tsx         # Página inicial
│   │   │   ├── denunciar/       # Formulário de denúncia
│   │   │   ├── mapa/            # Mapa público
│   │   │   └── admin/           # Painel administrativo
│   │   ├── components/          # Componentes React
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ReportForm.tsx
│   │   │   ├── ReportMap.tsx
│   │   │   └── admin/           # Componentes do admin
│   │   ├── contexts/            # Contextos (Auth)
│   │   ├── firebase/            # Configuração Firebase
│   │   └── types/               # Interfaces TypeScript
│   └── package.json
│
├── firestore.rules              # Regras do Firestore
├── storage.rules                # Regras do Storage
└── README.md
```

## 🗄️ Estrutura do Banco de Dados

### Collection: `denuncias`
```typescript
{
  reportType: 'anonymous' | 'identified',
  name?: string,
  email?: string,
  description: string,
  category: string,
  location: { latitude: number, longitude: number },
  imageUrls: string[],
  status: 'pendente' | 'em_analise' | 'resolvido',
  createdAt: Timestamp
}
```

### Collection: `report_categories`
```typescript
{
  name: string
}
```

## 📊 Rotas da Aplicação

| Rota | Descrição |
|------|-----------|
| `/` | Página inicial |
| `/denunciar` | Formulário de denúncia |
| `/mapa` | Mapa público de denúncias |
| `/admin` | Dashboard administrativo |
| `/admin/login` | Login do admin |
| `/admin/mapa` | Mapa administrativo |

## 🔒 Segurança

As regras do Firestore e Storage estão configuradas para:
- Permitir leitura pública de denúncias e categorias
- Permitir criação de denúncias sem autenticação
- Restringir operações administrativas a usuários autenticados

## 📝 Licença

Este projeto está sob a licença MIT.

## 👥 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

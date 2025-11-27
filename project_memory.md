# Memória do Projeto - Aplicativo de Denúncias Ambientais

## Status das Features

| Feature | Status | Prioridade | Descrição | Data de Atualização |
|---------|--------|------------|-----------|---------------------|
| Denúncias Anônimas | ✅ Concluído | Alta | Opção de denúncia anônima ou identificada (nome/email) | 2025-11-27 |
| Localização Automática | ✅ Concluído | Alta | Captura automática de GPS + opção manual | 2025-11-27 |
| Upload de Fotos | ✅ Concluído | Média | Upload de até 2 imagens com compressão | 2025-11-27 |
| Captura de Câmera | ✅ Concluído | Média | Tirar foto diretamente pelo navegador | 2025-11-27 |
| Categorias de Denúncia | ✅ Concluído | Alta | Categorias dinâmicas via Firestore | 2025-11-27 |
| Registro de Data/Hora | ✅ Concluído | Média | Captura automática + edição manual | 2025-11-27 |
| Mapa Interativo | ✅ Concluído | Alta | Mapa com Leaflet/OpenStreetMap | 2025-11-27 |
| Painel Admin | ✅ Concluído | Média | Dashboard com filtros e paginação | 2025-11-27 |
| Relatórios | ✅ Concluído | Baixa | Exportação CSV/PDF com filtros | 2025-11-27 |
| Testes | ⏳ Pendente | Média | Testes unitários e de integração | - |
| Deploy | ⏳ Pendente | Alta | Implantação em produção | - |

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15.3 + React 19 + TypeScript |
| Estilização | TailwindCSS 4 |
| Banco de Dados | Firebase Firestore |
| Armazenamento | Firebase Storage |
| Autenticação | Firebase Auth |
| Mapas | Leaflet + OpenStreetMap |
| PDF | @react-pdf/renderer |

## Estrutura de Dados

### Collection: `denuncias`
- `reportType`: 'anonymous' | 'identified'
- `name`, `email`: string (opcional)
- `description`: string
- `category`: string
- `location`: { latitude, longitude }
- `imageUrls`: string[]
- `status`: 'pendente' | 'em_analise' | 'resolvido'
- `createdAt`: Timestamp

### Collection: `report_categories`
- `name`: string

## Próximos Passos
1. Implementar testes unitários
2. Refinar regras de segurança Firebase para produção
3. Configurar CI/CD
4. Deploy em produção (Vercel/Netlify)

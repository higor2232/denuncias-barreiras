# Memória do Projeto - Aplicativo de Denúncias Ambientais

## Status das Features

| Feature | Status | Prioridade | Descrição | Data de Atualização |
|---------|--------|------------|-----------|---------------------|
| Denúncias Anônimas | Pendente | Alta | Implementar opção de denúncia anônima ou identificada (nome/email) | 2025-06-11 |
| Localização Automática | Pendente | Alta | Captura automática de GPS + opção manual | 2025-06-11 |
| Upload de Fotos | Pendente | Média | Upload de até 2 imagens com validação | 2025-06-11 |
| Categorias de Denúncia | Pendente | Alta | Menu com categorias de problemas ambientais | 2025-06-11 |
| Registro de Data/Hora | Pendente | Média | Captura automática + edição manual | 2025-06-11 |
| Mapa Interativo | Pendente | Alta | Mapa com pinos de denúncias e filtros | 2025-06-11 |
| Relatórios Administrativos | Pendente | Baixa | Geração de relatórios CSV/PDF e visualizações | 2025-06-11 |

## Histórico de Desenvolvimento

| Data | Atividade | Responsável | Observações |
|------|-----------|-------------|-------------|
| 2025-06-11 | Criação da estrutura inicial do projeto | Equipe | Configuração inicial, definição de arquitetura |

## Decisões Técnicas

### Arquitetura
- **Frontend**: React.js com Next.js
- **Backend**: Node.js com Express
- **Banco de Dados**: MongoDB
- **Armazenamento de Imagens**: Firebase Storage
- **Mapas**: Leaflet com OpenStreetMap

### Autenticação
- Sem login formal com senha
- Opção de identificação simples (nome/email) ou modo anônimo

### Armazenamento de Dados
- Denúncias anônimas não armazenam dados pessoais
- Imagens comprimidas e armazenadas em nuvem

## Próximos Passos
1. Configurar ambiente de desenvolvimento
2. Implementar estrutura básica do frontend
3. Implementar estrutura básica do backend
4. Implementar feature de denúncias anônimas
5. Implementar captura de localização

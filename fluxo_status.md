# Fluxo de Status das Denúncias

Este documento descreve o fluxo de status das denúncias ambientais no aplicativo, voltado tanto para desenvolvedores quanto para a equipe administrativa.

## Status disponíveis

Os seguintes status são suportados e centralizados no tipo `ReportStatus` em `src/types/index.ts`:

- `pendente`
- `em_analise`
- `aprovada`
- `resolvida`
- `rejeitada`

No código, eles são exportados como:

```ts
export const REPORT_STATUSES = ['pendente', 'em_analise', 'aprovada', 'resolvida', 'rejeitada'] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
```

## Significado de cada status

- **pendente**  
  Denúncia recém-recebida, aguardando análise pela equipe responsável.

- **em_analise**  
  A denúncia está em avaliação. A equipe pode estar verificando informações, consultando outros órgãos ou aguardando mais dados.

- **aprovada**  
  A denúncia foi validada e considerada pertinente. A partir desse status ela **aparece no mapa público** (`/mapa`) e em relatórios públicos/indicadores.

- **resolvida**  
  Alguma ação foi tomada para tratar o problema relatado (por exemplo, fiscalização realizada, limpeza efetuada, notificação emitida). Continua disponível para histórico e relatórios.

- **rejeitada**  
  A denúncia não pôde ser atendida, geralmente por um dos motivos:
  - Falta de informações suficientes.
  - Denúncia duplicada.
  - Situação fora do escopo ambiental da plataforma.

## Fluxo típico da denúncia

1. **Criação**  
   - Origem: formulário público em `/denunciar`.
   - Status inicial: `pendente`.
   - Campos principais salvos: descrição, categoria, localização (quando disponível), imagens, dados do usuário (quando identificado) e timestamp de criação.

2. **Triagem / Análise**  
   - Origem: painel administrativo `/admin` ou mapa admin `/admin/mapa`.
   - O operador pode alterar o status para `em_analise` quando começar a avaliar o caso.

3. **Validação**  
   - Se a denúncia for considerada válida e pertinente:
     - Status alterado para `aprovada`.
     - A denúncia passa a aparecer no **mapa público** `/mapa` (apenas denúncias aprovadas são exibidas ao cidadão).

4. **Encerramento**  
   - Após alguma ação concreta:
     - Status alterado para `resolvida`.
     - A denúncia continua visível para a equipe admin (histórico, relatórios), mas a política de exibição pública pode ser ajustada conforme a necessidade (atualmente o mapa público mostra apenas `aprovada`).

5. **Rejeição**  
   - Se a denúncia não puder ser atendida, o operador pode marcá-la como `rejeitada`.
   - Ela não será exibida no mapa público, mas permanece registrada para fins internos e estatísticos.

## Onde o status é usado no sistema

- **Formulário de denúncia (`ReportForm.tsx`)**  
  - Ao criar uma denúncia, o campo `status` é definido como `pendente`.

- **Painel Admin (`AdminDashboard.tsx`)**  
  - Exibe o status com cores diferentes.
  - Permite alterar para todos os estados (`pendente`, `em_analise`, `aprovada`, `resolvida`, `rejeitada`).
  - Usa o status nos filtros e nos resumos (cards de contagem e relatórios CSV/PDF).

- **Mapa Admin (`AdminLeafletMap.tsx`)**  
  - Marcadores coloridos conforme o status.
  - Popup permite alterar o status diretamente no mapa, usando os mesmos valores tipados.

- **Mapa Público (`/app/mapa/page.tsx`)**  
  - Só mostra denúncias com `status === 'aprovada'`.

- **Página de acompanhamento do cidadão (`/app/denuncia/[id]/page.tsx`)**  
  - Mostra o status atual com um selo (badge) colorido.
  - Apresenta micro-textos explicando o significado de cada status.

## Regras de segurança (Firestore)

No arquivo `firestore.rules`, as regras restringem updates em `denuncias` para apenas mudanças de `status` e somente para valores válidos:

```txt
function isValidStatusUpdate(before, after) {
  let allowed = ['pendente', 'em_analise', 'aprovada', 'resolvida', 'rejeitada'];
  return before.diff(after).changedKeys().hasOnly(['status'])
         && after.status in allowed;
}
```

Isso garante que:

- Apenas usuários autenticados possam alterar o status.
- Nenhum outro campo (como descrição, imagens, localização) seja alterado via painel/mapa.
- Valores de status inválidos sejam rejeitados pelas regras de segurança.

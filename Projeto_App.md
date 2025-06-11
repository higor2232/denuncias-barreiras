### **🛠️ Especificações Técnicas Funcionais – Aplicativo de Denúncias Ambientais**

**1\. Denúncias Anônimas**

* O sistema deve permitir que o usuário escolha entre dois modos ao iniciar uma denúncia: identificado (registrando nome/e-mail) ou anônimo (sem identificação).

* Quando selecionado o modo anônimo, os campos de identificação devem ser ocultados ou ignorados na submissão.

* O banco de dados deve armazenar a denúncia sem vincular a dados pessoais nesse modo.

**2\. Localização Automática via GPS \+ Inserção Manual**

* Ao abrir a tela de denúncia, o app deve requisitar permissão de localização e capturar as coordenadas GPS automaticamente.

* Deve haver uma opção “Inserir localização manualmente” que, se acionada, permita ao usuário digitar endereço, bairro, ponto de referência ou selecionar no mapa com um pin arrastável.

* As coordenadas (latitude/longitude) devem ser salvas para uso no mapa.

**3\. Upload de Fotos**

* O usuário deve poder anexar até **2 imagens** (ajustável), podendo tirar fotos com a câmera ou selecionar da galeria.

* As imagens devem ser comprimidas (para upload rápido) e armazenadas em nuvem ou servidor vinculado à denúncia via ID único.

* O sistema deve validar tamanho e formato (.jpg, .png).

**4\. Botão para Indicar o Problema (Categoria de Denúncia)**

* Deve existir um menu com botões ou ícones clicáveis representando as categorias:

  * Queimada  
  * Mato Alto   
  * Despejo de lixo

  * Desmatamento

  * Maus-tratos a animais

  * Poluição sonora

  * Outros (com campo aberto para especificar)

* A categoria selecionada deve ser registrada junto à denúncia como metadado para filtros e relatórios.

**5\. Registro de Data e Hora da Ocorrência**

* O sistema deve registrar a data e hora automaticamente no momento do envio da denúncia.

* Também deve permitir ao usuário editar esse campo se a ocorrência tiver acontecido em outro momento (com seleção em calendário e relógio digital).

**6\. Mapa da Cidade com Pinos de Denúncia**

* O app deve incluir uma tela com um mapa interativo (ex.: via Google Maps API ou OpenStreetMap).

* Cada denúncia será representada por um “pin” georreferenciado com ícone correspondente à categoria do problema.

* Ao clicar no pin, abrir um pop-up com: tipo de denúncia, data/hora, e imagem (miniatura).

* Incluir filtros por data, tipo de ocorrência e status da denúncia (aberta, resolvida, etc.).

**7\. Geração de Relatórios Administrativos**

* Área de administração (painel web ou app restrito) com login para administradores.

* Deve permitir:

  * Exportar todas as denúncias em **formato .CSV ou .PDF**, com dados organizados por data, tipo, local e situação.

  * Gerar **relatório visual no mapa**, com os pinos coloridos por categoria e número de ocorrências por região.

  * Gerar gráficos de resumo (ex: número de denúncias por bairro ou tipo).

* Botão “Gerar Relatório” deve coletar dados atualizados em tempo real e oferecer para download ou impressão.

* Relatórios podem poder ser enviados automaticamente por e-mail aos órgãos cadastrados (prefeitura, câmara, etc.).


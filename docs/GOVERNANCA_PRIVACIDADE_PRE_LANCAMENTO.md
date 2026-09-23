# Governança de privacidade antes do lançamento

Decisão conservadora de **23/09/2026**: manter entrega de briefing, analytics, upload, indexação e marketing desligados enquanto não houver controlador identificado, canal de direitos, retenção, fornecedores e texto aprovados. A página atual descreve apenas a prévia técnica.

Esta é uma regra de engenharia e lançamento, não um parecer jurídico. A validação deve ser feita pelo responsável jurídico/privacidade com os fatos reais da organização.

## Fatos obrigatórios

| Campo                              | Situação      | Evidência necessária                                                                  |
| ---------------------------------- | ------------- | ------------------------------------------------------------------------------------- |
| Razão social e CNPJ do controlador | Ausente       | Registro informado pelo responsável da empresa.                                       |
| Endereço e contato institucional   | Ausente       | Canal publicado e monitorado.                                                         |
| Canal para direitos dos titulares  | Ausente       | E-mail/formulário com responsável e substituto.                                       |
| Finalidades e bases aplicáveis     | Não aprovadas | Mapa por campo e ação, revisado pelo responsável.                                     |
| Retenção por sistema               | Não aprovada  | Prazo, gatilho de exclusão e exceções documentadas.                                   |
| Operadores/fornecedores            | Parcial       | Inventário de Vercel, Supabase, receptor, e-mail/WhatsApp e analytics, quando usados. |
| Transferências e localização       | Não avaliadas | Contratos e configuração efetiva dos serviços.                                        |
| Segurança e resposta a incidente   | Parcial       | Responsáveis, logs mínimos, exercício e contatos.                                     |

## Mapa mínimo do tratamento futuro

| Etapa                | Dados                                                        | Finalidade                        | Sistema                    | Acesso                        | Estado atual                  |
| -------------------- | ------------------------------------------------------------ | --------------------------------- | -------------------------- | ----------------------------- | ----------------------------- |
| Seleção local        | IDs e quantidades de produtos                                | Preparar a seleção                | Navegador                  | Usuário do aparelho           | Ativo, sem contato.           |
| Download do briefing | Seleção e campos digitados                                   | Gerar arquivo solicitado          | Memória/navegador          | Usuário                       | Ativo, sem envio ao servidor. |
| Entrada comercial    | Nome, empresa, contato, seleção, ocasião, datas e observação | Analisar e responder solicitação  | Banco premium              | Backend e operação autorizada | Desligado.                    |
| Receptor/CRM         | Mesmo payload mínimo e protocolo                             | Distribuir e atender oportunidade | Receptor a homologar       | Comercial autorizado          | Inexistente.                  |
| Confirmação          | Protocolo e canal escolhido                                  | Confirmar recebimento             | Provedor a homologar       | Operação autorizada           | Inexistente.                  |
| Analytics            | Eventos enumerados sem texto livre                           | Medir funil e qualidade           | Ferramenta a aprovar       | Produto/dados                 | Desligado.                    |
| Upload de marca      | Arquivo, metadados e vínculo                                 | Preparar personalização           | Storage privado a projetar | Operação autorizada           | Fora do MVP.                  |

## Processo de direitos a implementar

1. Receber a solicitação em canal monitorado e gerar protocolo privado.
2. Confirmar identidade de forma proporcional ao pedido, sem coletar excesso.
3. Classificar acesso, confirmação, correção, informação, oposição, eliminação ou outro direito aplicável.
4. Localizar dados por identificadores autorizados nos sistemas inventariados.
5. Registrar decisão, responsáveis, consultas e prazo; aplicar exceções somente com justificativa aprovada.
6. Responder pelo canal seguro e registrar a conclusão sem expor dados em logs.
7. Testar o processo com dados sintéticos antes do lançamento e repetir anualmente ou após mudança material.

A ANPD descreve o controlador como o agente que toma as decisões sobre o tratamento e orienta que solicitações de titulares sejam dirigidas a ele. Também informa que agentes de pequeno porte que não indiquem encarregado devem disponibilizar canal de comunicação. Fontes oficiais: [titular de dados](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados), [direitos dos titulares](https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares), [guia dos agentes de tratamento](https://www.gov.br/anpd/pt-br/assuntos/noticias/nova-versao-do-guia-dos-agentes-de-tratamento) e [Resolução CD/ANPD nº 2/2022](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022).

## Gate de ativação

`BRIEFING_DELIVERY_ENABLED` só pode mudar para `true` depois de:

- completar e aprovar a tabela de fatos;
- publicar política coerente com o fluxo real;
- homologar receptor e confirmação transacional;
- executar teste de direitos e exclusão com dados sintéticos;
- validar acesso, logs, retenção, backup e incidente;
- registrar responsáveis nominais e substitutos;
- passar staging, piloto de vendedores e decisão formal de release.

Analytics, upload e indexação possuem gates próprios e não são liberados automaticamente junto com o briefing.

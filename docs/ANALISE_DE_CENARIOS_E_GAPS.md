# Simulação de cenários e gates

Data da revisão: 21/09/2026. Esta análise foi executada antes da expansão técnica para não transformar hipóteses de negócio em funcionalidades definitivas.

**Atualização de 22/09:** a [revisão exaustiva das 200 etapas](REVISAO_EXAUSTIVA_PLANO.md) substitui a classificação de conclusão anterior. Os defeitos técnicos de idempotência concorrente, limite real de corpo, validade da seleção entre rotas, retorno do formulário, fonte única do catálogo e movimento reduzido foram corrigidos e verificados por cenários sintéticos ou browser. Os gates de CRM, jurídico, operação e dados vivos continuam abertos.

| Cenário simulado | Falha que seria inaceitável | Controle implementado | Evidência a executar |
|---|---|---|---|
| Catálogo retorna zero, campo muda ou mídia falha | Vitrine vazia parecer falta de produtos ou expor coluna interna | Snapshot tipado, projeção allowlist, paginação determinística e páginas por slug | Validar `v_products_public` viva, mídia autorizada e contrato em staging |
| Comprador repete o envio | Duas oportunidades ou duas propostas | Chave/hash persistidos, lease atômica de entrega, protocolo e retry estável no navegador | Exercitar retry, conciliação e criação real de oportunidade no CRM homologado |
| Receptor comercial não foi configurado | Interface afirmar envio sem destino | `503` explícito e fallback de download local | Configurar receptor aprovado e testar a jornada com vendedores |
| Navegador injeta preço, SKU ou quantidade inválida | Custo, margem ou regra interna influenciar proposta | Validação no servidor resolve produto por ID e mínimo no catálogo público | Adaptador canônico e teste contra payload adulterado |
| Origem externa ou abuso automatizado | Spam, exfiltração ou sobrecarga | Verificação de origem, limite por endereço, timeout e CSP | WAF/rate limit distribuído, logs e modelo de ameaça aprovado |
| Catálogo/briefing em ambiente de preview | Indexação ou dado comercial público | `noindex` padrão, robots bloqueado e indexação exige variável explícita | Domínio, política, consentimento e release aprovados |
| Múltiplas réplicas ou reinicialização | Cache de idempotência perdido | Registro e lease no banco sobrevivem ao processo; o rate limit local não é suficiente | WAF/rate limit distribuído, conciliação e rollback operacional exercitados |

## Leitura honesta do plano de 200 etapas

As etapas pendentes continuam abertas quando exigem evidência de pessoas, operação, jurídico, ambiente ou dados vivos. Entrevistas, testes com compradores, aprovação de mídias e preços, auditoria administrativa do Supabase, definição de CRM, política de privacidade, domínio, piloto e monitoramento não podem ser “concluídos” por código local.

As entregas locais agora reduzem o risco dessas frentes: contrato público, rota de catálogo, páginas SSR por produto, fluxo de fallback, contrato de briefing, headers, base de robots/sitemap e roteiro de cenários. Elas não liberam os gates G2, G4, G5 ou G6 sem as evidências especificadas no [plano](PLANO_200_ETAPAS.md).

## Ordem sem retrabalho

1. Confirmar dados, direitos de imagem, quantidades, preços e proprietário comercial.
2. Validar views, permissões e contrato no Supabase canônico com acesso autorizado.
3. Escolher receptor; integrar e exercitar retries, conciliação e criação de oportunidade em staging.
4. Fechar privacidade, retenção, suporte a titulares e consentimento de métricas.
5. Rodar pesquisas, acessibilidade manual, dispositivos, carga e piloto.
6. Só então configurar domínio, indexação, observabilidade, rollout reversível e monitoramento.

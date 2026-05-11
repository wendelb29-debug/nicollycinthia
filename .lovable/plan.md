# Plano de implementação — Nicolly Cinthia Nail Club

O escopo é grande (3 painéis + integração de pagamento Asaas + WhatsApp via Uazapi + chatbot IA). Vou entregar em **5 fases incrementais**, cada uma testável isoladamente. Confirme a ordem antes de eu começar.

## Fase 1 — Estrutura de dados e Painel Admin (base)
**Banco (migração única):**
- Tabelas novas: `appointments`, `conversations`, `messages`, `settings`
- RLS: admin total; cliente vê só seus `appointments`; profissional vê agendamentos atribuídos
- Realtime habilitado em `conversations` e `messages`

**Layout admin com sidebar** em `/admin/*`:
- `/admin/dashboard` (visão geral — já existe, refinar)
- `/admin/assinantes` — tabela de clientes com filtros (status, plano, busca), badge colorido (verde/amarelo/vermelho)
- `/admin/agenda` — calendário semanal (todos profissionais)
- `/admin/planos` — CRUD de planos
- `/admin/atendimentos` — inbox WhatsApp (UI; backend na Fase 4)
- `/admin/configuracoes` — Asaas, Uazapi, Chatbot

## Fase 2 — Painel Cliente e Profissional
- `/cliente/dashboard` (refinar) + `/cliente/agendar` (selecionar serviço/data/hora, respeitando `weekly_limit`)
- `/cliente/historico`, cancelar/remarcar com antecedência mínima (config)
- `/profissional/agenda` (refinar) — confirmar/recusar/concluir, ver endereço e observações do cliente

## Fase 3 — Integração Asaas (pagamentos recorrentes)
**Decisão:** Asaas exige API Key privada e webhooks → uso server functions do TanStack Start, não edge functions.
- Secret: `ASAAS_API_KEY` (+ flag sandbox/produção em `settings`)
- Server fn `createAsaasCustomer` ao cadastrar cliente (gatilho: cliente escolhe plano)
- Server fn `createAsaasSubscription` (ciclo MONTHLY, valor do plano)
- Rota pública `/api/public/asaas-webhook` — atualiza `clients.status` em PAYMENT_RECEIVED / OVERDUE / SUBSCRIPTION_CANCELLED (com verificação de token compartilhado)
- UI em `/admin/configuracoes` para inserir API key + botão "testar conexão"

## Fase 4 — Integração Uazapi (WhatsApp) + Inbox
- Secrets: `UAZAPI_URL`, `UAZAPI_API_KEY`
- UI de configurações: URL, API key, exibir QR code, status da conexão (polling em endpoint do Uazapi)
- Rota pública `/api/public/uazapi-webhook` — recebe mensagens, upsert em `conversations`/`messages`, vincula a `clients` se telefone bater
- Inbox `/admin/atendimentos` em tempo real (Supabase Realtime), responder/transferir/marcar status
- Server fn `sendWhatsAppMessage` (POST /send/text via Uazapi)

## Fase 5 — Chatbot IA
- Usa **Lovable AI Gateway** (sem pedir chave OpenAI — economiza secret)
- Tabela `settings` guarda: nome do bot, prompt, horário, mensagem de ausência, on/off
- No webhook Uazapi: se conversa não tem `assigned_to` humano e bot ligado → server fn `runChatbot` consulta histórico, chama IA com prompt + ferramentas (cadastrar lead, gerar link Asaas, agendar/remarcar/cancelar, transferir p/ humano)
- UI em `/admin/configuracoes` para editar prompt e regras

## Decisões técnicas
- **Pagamentos:** Asaas (pedido explícito do usuário) via server fn + webhook. Stripe não se aplica.
- **IA do chatbot:** Lovable AI Gateway (`google/gemini-2.5-flash` por padrão) — sem custo de secret extra. Posso permitir override por chave OpenAI nas configs depois se quiser.
- **WhatsApp:** Uazapi (pedido explícito) — não há conector nativo, será HTTP direto.
- **Realtime:** Supabase Realtime para inbox e agenda.
- **Roles:** mantém o esquema atual `user_roles` + `has_role()`. Nada de mudança em auth.

## Confirmações que preciso antes de começar

1. **Ordem das fases ok?** Posso começar pela Fase 1 (estrutura + admin) agora e seguir nas próximas respostas, ou prefere outra ordem (ex: pagamento primeiro)?
2. **Secrets Asaas e Uazapi:** Você já tem as chaves? Vou pedir via `add_secret` quando chegar nas fases 3 e 4. OK?
3. **Profissionais:** quem cadastra? Admin cria via `/admin/configuracoes` (ou nova tela `/admin/profissionais`) com convite por e-mail? Confirma esse fluxo?
4. **Antecedência mínima de cancelamento:** 24h ok como padrão (editável nas configurações)?

Responda "ok, começa pela Fase 1" (ou ajustes) e eu executo a Fase 1 inteira na próxima mensagem.

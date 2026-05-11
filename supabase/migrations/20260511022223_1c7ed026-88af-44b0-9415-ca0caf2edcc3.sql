
-- appointments
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  service TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_appointments_client ON public.appointments(client_id);
CREATE INDEX idx_appointments_professional ON public.appointments(professional_id);
CREATE INDEX idx_appointments_scheduled ON public.appointments(scheduled_at);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage appointments" ON public.appointments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Clients view own appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid()));

CREATE POLICY "Clients insert own appointments" ON public.appointments
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid()));

CREATE POLICY "Clients update own appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_id AND c.user_id = auth.uid()));

CREATE POLICY "Professionals view assigned appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (professional_id = auth.uid());

CREATE POLICY "Professionals update assigned appointments" ON public.appointments
  FOR UPDATE TO authenticated
  USING (professional_id = auth.uid());

-- conversations
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'open',
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_conversations_phone ON public.conversations(phone);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage conversations" ON public.conversations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  from_me BOOLEAN NOT NULL DEFAULT false,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage messages" ON public.messages
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- settings
CREATE TABLE public.settings (
  key TEXT PRIMARY KEY,
  value JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage settings" ON public.settings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- updated_at trigger function (idempotent)
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_settings_updated_at BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;

-- seed default settings
INSERT INTO public.settings (key, value) VALUES
  ('chatbot', '{"enabled": false, "bot_name": "Nicolly", "system_prompt": "Você é a Nicolly, assistente do Nail Club. Atenda com elegância, simpatia e objetividade.", "business_hours": "09:00-19:00", "away_message": "Estamos fora do horário. Retornaremos em breve."}'::jsonb),
  ('asaas', '{"environment": "sandbox", "webhook_token": null}'::jsonb),
  ('uazapi', '{"base_url": null, "instance": null}'::jsonb),
  ('booking', '{"min_cancel_hours": 24}'::jsonb)
ON CONFLICT (key) DO NOTHING;

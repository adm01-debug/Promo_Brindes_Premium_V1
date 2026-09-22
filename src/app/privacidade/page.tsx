import Link from "next/link";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Privacidade da prévia | Promo Brindes Premium",
};
export default function Privacy() {
  const deliveryActive = Boolean(process.env.BRIEFING_WEBHOOK_URL);
  return (
    <main className="legal-page">
      <Link href="/">← Voltar à curadoria</Link>
      <p className="eyebrow" style={{ marginTop: 40 }}>
        TRANSPARÊNCIA EM CADA DETALHE
      </p>
      <h1>Privacidade desta prévia.</h1>
      <p>
        Esta é uma versão de demonstração do conceito Promo Brindes Premium,
        preparada em 20 de setembro de 2026. Não há pagamento, reserva de
        estoque ou confirmação automática de proposta.
      </p>
      <h2>Seleção e favoritos</h2>
      <p>
        A seleção de produtos e os favoritos ficam no armazenamento local do seu
        navegador. São salvos apenas identificadores de produtos e quantidades.
        Para remover esses registros, limpe os dados deste site nas
        configurações do navegador.
      </p>
      <h2>Seu briefing</h2>
      <p>
        {deliveryActive
          ? "Nome, empresa, e-mail e observações são enviados ao canal comercial configurado somente quando você aciona o envio. O protocolo aparece após a confirmação do servidor. A versão comercial deve substituir esta página por política aprovada que identifique controlador, finalidade, retenção e canais de atendimento."
          : "Nome, empresa, e-mail e observações informados no formulário são utilizados no seu navegador para gerar o arquivo que você solicita baixar. A aplicação não transmite esses campos ao servidor nem os persiste em armazenamento local."}
      </p>
      <h2>Imagens e serviços</h2>
      <p>
        As imagens de produto e as fontes são servidas por este site. A
        navegação desta prévia não instala ferramentas de publicidade ou
        analytics. O servidor que hospeda a aplicação poderá manter registros
        técnicos de acesso conforme sua configuração.
      </p>
      <h2>Antes da abertura comercial</h2>
      <p>
        A versão comercial deverá identificar o controlador e seus canais de
        contato, informar finalidades, bases legais, retenção, direitos e
        eventuais operadores e transferências. Essa política precisa acompanhar
        a implementação efetiva e a revisão da empresa responsável.
      </p>
    </main>
  );
}

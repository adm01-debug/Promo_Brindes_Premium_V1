import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CatalogHeader() {
  return (
    <>
      <a href="#conteudo" className="skip-link">
        Pular para o conteúdo
      </a>
      <header className="site-header library-header">
        <Link
          href="/"
          className="brand"
          aria-label="Promo Brindes Premium, início"
        >
          <span className="brand-emblem" aria-hidden="true">
            p<span>.</span>
          </span>
          <span className="brand-name">
            PROMO BRINDES<span>PREMIUM COLLECTION</span>
          </span>
        </Link>
        <nav aria-label="Navegação principal" className="library-nav">
          <Link href="/#curadoria">A curadoria</Link>
          <Link href="/catalogos" aria-current="true">
            Catálogos
          </Link>
        </nav>
      </header>
    </>
  );
}

export function CatalogFooter() {
  return (
    <footer className="library-footer">
      <div>
        <span className="eyebrow">PROMO BRINDES PREMIUM</span>
        <p>
          Presentes com intenção.
          <br />
          Relações com significado.
        </p>
      </div>
      <nav aria-label="Navegação do rodapé">
        <Link href="/#curadoria">
          Explorar a curadoria <ArrowRight size={15} aria-hidden="true" />
        </Link>
        <Link href="/catalogos">Todos os catálogos</Link>
        <Link href="/privacidade">Privacidade</Link>
      </nav>
      <small>Condições, personalização e disponibilidade sob consulta.</small>
    </footer>
  );
}

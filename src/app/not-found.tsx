import Link from "next/link";
export default function NotFound() {
  return (
    <main className="legal-page">
      <p className="eyebrow">404 · UM NOVO CAMINHO</p>
      <h1>Esta página ainda não faz parte da coleção.</h1>
      <p>Volte à curadoria para encontrar um presente com a sua essência.</p>
      <Link className="button button-gold" href="/" style={{ marginTop: 30 }}>
        Explorar a curadoria →
      </Link>
    </main>
  );
}

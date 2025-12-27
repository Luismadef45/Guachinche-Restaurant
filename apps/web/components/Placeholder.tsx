import Link from "next/link";

type PlaceholderProps = {
  title: string;
  description: string;
};

export default function Placeholder({ title, description }: PlaceholderProps) {
  return (
    <main className="placeholder">
      <div className="placeholder-card">
        <p className="placeholder-eyebrow">Coming soon</p>
        <h1 className="placeholder-title">{title}</h1>
        <p className="placeholder-text">{description}</p>
        <Link className="placeholder-link" href="/">
          Back to landing
        </Link>
      </div>
    </main>
  );
}

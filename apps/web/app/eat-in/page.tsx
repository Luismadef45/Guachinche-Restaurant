import Placeholder from "../../components/Placeholder";

type EatInPageProps = {
  searchParams?: {
    table?: string;
    session?: string;
  };
};

export default function EatInPage({ searchParams }: EatInPageProps) {
  const table = searchParams?.table;
  const session = searchParams?.session;
  const description = table
    ? `Table ${table} session detected.`
    : session
      ? `Session ${session} detected.`
      : "This is where table sessions and QR ordering will start.";

  return <Placeholder title="Eat-in ordering" description={description} />;
}

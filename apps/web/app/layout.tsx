import "./globals.css";

export const metadata = {
  title: "Guachinche Restaurant OS",
  description: "Customer entry and experience routing for Guachinche."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

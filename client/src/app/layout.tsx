import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="">{children}</body>
    </html>
  );
}

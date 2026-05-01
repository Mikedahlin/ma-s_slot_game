export const metadata = {
  title: "Lynne's Luxe Lights",
  description: "Social casino slot lounge"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, sans-serif",
          background: "radial-gradient(circle at top, #1b1b3a, #050510)",
          color: "white"
        }}
      >
        {children}
      </body>
    </html>
  );
}

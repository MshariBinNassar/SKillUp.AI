import "./globals.css";
import Header from "@/components/Header";

export const metadata = {
  title: "SkillUp",
  description: "Career readiness platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {/* App Shell */}
        <div className="flex min-h-screen flex-col">
          {/* Header */}
          <Header />

          {/* Page Content */}
          <main className="flex-1">
            <div className="mx-auto max-w-6xl px-4 py-6">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4">
        {/* Brand */}
        <Link
          href="/"
          className="text-lg font-bold tracking-tight"
        >
          SkillUp
        </Link>

        {/* Navigation */}
        <nav className="ml-10 flex gap-6 text-sm font-medium text-gray-600">
          <Link
            href="/checklists"
            className="transition hover:text-gray-900"
          >
            Checklists
          </Link>
        </nav>
      </div>
    </header>
  );
}

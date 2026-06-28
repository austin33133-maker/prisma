export function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-gray-500">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <p className="text-base font-bold text-brand-700">
              NOVA<span className="text-gray-900">shop</span>
            </p>
            <p className="mt-1">A demo standalone store built with Next.js &amp; Prisma.</p>
          </div>
          <p>© {new Date().getFullYear()} NOVAshop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

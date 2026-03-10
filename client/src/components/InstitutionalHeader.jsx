import { Search } from 'lucide-react';
import etecLogo from '../assets/etec_registro.png';

export default function InstitutionalHeader({
  title,
  subtitle,
  navItems = [],
  actionItems = [],
  compact = false,
  hideHeading = false,
}) {
  return (
    <div className="border-b border-[var(--line)] bg-white shadow-[0_14px_32px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-52 items-center justify-center bg-white">
              <img
                src={etecLogo}
                alt="Logo Etec Registro e Centro Paula Souza"
                className="max-h-16 w-auto object-contain"
              />
            </div>

            {!hideHeading ? (
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[var(--brand-red)]">
                  Centro Paula Souza
                </p>
                <h1 className="text-2xl font-bold text-[var(--ink)] md:text-3xl">{title}</h1>
                <p className="text-sm text-[var(--muted)]">{subtitle}</p>
              </div>
            ) : null}
          </div>

          <div className="flex flex-col gap-3 md:items-end">
            <label className="flex w-full min-w-0 items-center overflow-hidden rounded-full border border-[#d7d9de] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:w-[32rem]">
              <input
                type="text"
                placeholder="O que deseja localizar?"
                className="h-14 flex-1 bg-transparent px-6 text-sm text-[var(--muted)] outline-none"
              />
              <span className="flex h-14 w-16 items-center justify-center border-l border-[#e5e7eb] text-[var(--brand-red)]">
                <Search size={22} />
              </span>
            </label>
          </div>
        </div>
      </div>

      {!compact ? (
        <nav className="w-full bg-[var(--brand-red)] text-white shadow-[0_8px_18px_rgba(130,0,0,0.18)]">
          <div className="mx-auto flex max-w-7xl flex-col justify-between md:flex-row">
            <ul className="flex flex-wrap">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="border-r border-[rgba(0,0,0,0.16)] px-5 py-4 text-sm font-medium tracking-[0.02em] transition-colors hover:bg-[var(--brand-red-dark)]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap md:justify-end">
              {actionItems.map((item) => (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={item.onClick}
                    className="border-l border-[rgba(0,0,0,0.16)] px-5 py-4 text-sm font-medium tracking-[0.02em] transition-colors hover:bg-[var(--brand-red-dark)]"
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

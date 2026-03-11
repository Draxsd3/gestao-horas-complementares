import { useState } from 'react';
import { Menu, Search, UserRound, X } from 'lucide-react';
import etecLogo from '../assets/etec_registro.png';
import { getStoredUser } from '../utils/session';

export default function InstitutionalHeader({
  title,
  subtitle,
  navItems = [],
  actionItems = [],
  compact = false,
  hideHeading = false,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const usuario = getStoredUser();
  const profileNavItem = navItems.find((item) => item.label === 'Perfil');
  const mobileNavItems = navItems.filter((item) => item.label !== 'Perfil');
  const profileImage = usuario ? localStorage.getItem(`usuario-imagem-${usuario.id}`) || '' : '';

  const handleItemClick = (onClick) => {
    setMobileMenuOpen(false);
    onClick();
  };

  return (
    <div className="border-b border-[var(--line)] bg-white shadow-[0_14px_32px_rgba(0,0,0,0.05)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-5 md:px-6 lg:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex flex-col items-center gap-4 md:items-start">
            <div className="flex w-full items-start justify-center gap-4 md:justify-start">
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

            {!compact ? (
              <button
                type="button"
                onClick={() => setMobileMenuOpen((state) => !state)}
                className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--line)] text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)] md:hidden"
                aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            ) : null}

            <label className="flex w-full min-w-0 items-center overflow-hidden rounded-full border border-[#d7d9de] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.05)] md:hidden">
              <input
                type="text"
                placeholder="O que deseja localizar?"
                className="h-12 flex-1 bg-transparent px-5 text-sm text-[var(--muted)] outline-none"
              />
              <span className="flex h-12 w-14 items-center justify-center border-l border-[#e5e7eb] text-[var(--brand-red)]">
                <Search size={20} />
              </span>
            </label>
          </div>

          <div className="hidden flex-col gap-3 md:flex md:items-end">
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
        <>
          <nav className="hidden w-full bg-[var(--brand-red)] text-white shadow-[0_8px_18px_rgba(130,0,0,0.18)] md:block">
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

          {mobileMenuOpen ? (
            <div className="border-t border-[var(--line)] bg-white px-4 pb-4 pt-2 shadow-[0_14px_32px_rgba(0,0,0,0.08)] md:hidden">
              <div className="space-y-6">
                {profileNavItem ? (
                  <button
                    type="button"
                    onClick={() => handleItemClick(profileNavItem.onClick)}
                    className="flex w-full items-center gap-4 rounded-[1.6rem] border border-[var(--line)] bg-[var(--panel-soft)] px-4 py-4 text-left transition-colors hover:border-[var(--brand-red)]"
                  >
                    <span className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-[1.2rem] bg-white text-[var(--brand-red)] shadow-[0_10px_22px_rgba(44,52,61,0.08)]">
                      {profileImage ? (
                        <img src={profileImage} alt="Foto do perfil" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={26} />
                      )}
                    </span>
                    <span className="flex-1">
                      <span className="block text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Meu perfil
                      </span>
                      <span className="mt-1 block text-base font-bold text-[var(--ink)]">
                        {usuario?.nome || 'Acessar perfil'}
                      </span>
                    </span>
                  </button>
                ) : null}

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Navegacao</p>
                  <div className="space-y-2">
                    {mobileNavItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleItemClick(item.onClick)}
                        className="flex w-full items-center justify-between rounded-2xl bg-[var(--panel-soft)] px-4 py-3 text-left text-sm font-semibold text-[var(--ink)] transition-colors hover:text-[var(--brand-red)]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--muted)]">Acoes</p>
                  <div className="space-y-2">
                    {actionItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleItemClick(item.onClick)}
                        className="flex w-full items-center justify-between rounded-2xl border border-[var(--line)] px-4 py-3 text-left text-sm font-semibold text-[var(--ink)] transition-colors hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}

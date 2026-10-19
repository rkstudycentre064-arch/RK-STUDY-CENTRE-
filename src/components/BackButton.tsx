import { ArrowLeft } from 'lucide-react';
import type { MainNavRoute } from '../types';

interface BackButtonProps {
  label?: string;
  fallbackRoute?: MainNavRoute;
  onNavigate?: (route: MainNavRoute) => void;
  onClick?: () => void;
  className?: string;
}

export function BackButton({
  label = 'वापस जाएं',
  fallbackRoute = 'home',
  onNavigate,
  onClick,
  className = '',
}: BackButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
      return;
    }

    if (onNavigate) {
      onNavigate(fallbackRoute);
      return;
    }

    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = fallbackRoute;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-sm sm:text-base font-black text-slate-800 bg-white border-2 border-slate-200 hover:bg-slate-50 hover:text-blue-800 hover:border-blue-300 transition-all cursor-pointer shadow-xs ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="w-5 h-5 text-slate-700 stroke-[2.5]" />
      <span>{label}</span>
    </button>
  );
}

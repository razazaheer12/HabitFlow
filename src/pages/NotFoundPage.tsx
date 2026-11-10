import React from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

interface NotFoundPageProps {
  message?: string;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  message = 'The page you are looking for doesn’t exist or has been moved.'
}) => {
  return (
    <div className="mx-auto w-full max-w-md py-16 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-surface border border-border flex items-center justify-center text-ink-muted mx-auto shadow-card">
        <Compass className="w-7 h-7" />
      </div>
      <div>
        <p className="text-5xl font-extrabold text-ink/10 tracking-tight">404</p>
        <h1 className="text-lg font-bold text-ink mt-2">Page not found</h1>
        <p className="text-sm text-ink-secondary mt-1 max-w-sm mx-auto leading-relaxed">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 min-h-[44px] rounded-xl bg-accent hover:bg-accent-hover text-ink-on-accent text-sm font-semibold shadow-card active:scale-[0.98] transition"
      >
        Back to Today
      </Link>
    </div>
  );
};

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
      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
        <Compass className="w-7 h-7" />
      </div>
      <div>
        <p className="text-5xl font-black text-slate-700 tracking-tight">404</p>
        <h1 className="text-lg font-bold text-white mt-2">Page not found</h1>
        <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">{message}</p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-sm font-semibold transition"
      >
        Back to Today
      </Link>
    </div>
  );
};

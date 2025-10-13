import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Sudharsan. All rights reserved.
          </p>
          <p className="flex items-center gap-2 text-center">
            Built with <Heart className="w-4 h-4 text-red-500 fill-red-500" /> using modern web technologies
          </p>
        </div>
      </div>
    </footer>
  );
}

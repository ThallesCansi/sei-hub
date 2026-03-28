import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

export function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-border bg-card py-6 text-center text-sm text-muted-foreground">
        <p>SEI – Sistema Estudantil Integrado © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Menu, X, Search, User, LogOut, Shield, BookOpen, Home, Calendar, Building2, Trophy } from 'lucide-react';

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Início', icon: Home },
    { to: '/biblioteca', label: 'Biblioteca', icon: BookOpen },
    { to: '/calendario', label: 'Calendário', icon: Calendar },
    { to: '/centro-academico', label: 'Centro Acadêmico', icon: Building2, public: true },
    { to: '/atletica', label: 'Atlética', icon: Trophy, public: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-card-navbar/95 backdrop-blur supports-[backdrop-filter]:bg-card-navbar/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-heading text-xl font-bold text-primary">
          SEI
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive(link.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:text-foreground hover:bg-card-navbar'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              {profile?.is_admin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-1" />
                    Admin
                  </Button>
                </Link>
              )}
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="gap-1.5">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-medium">
                      {profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {profile?.full_name?.split(' ')[0] || 'Perfil'}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link to="/login">
              <Button size="sm">Entrar</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-md hover:bg-muted"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card-navbar p-4 space-y-1">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium ${
                isActive(link.to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
          <div className="border-t border-border pt-2 mt-2">
            {user ? (
              <>
                {profile?.is_admin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted">
                    <Shield className="h-4 w-4" /> Admin
                  </Link>
                )}
                <Link to="/perfil" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted">
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.full_name} />
                    <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-medium">
                      {profile?.full_name?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  Meu Perfil
                </Link>
                <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:bg-muted">
                  <LogOut className="h-4 w-4" /> Sair
                </button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-muted">
                Entrar
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

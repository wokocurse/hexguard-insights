import { motion } from 'framer-motion';
import { Shield, LayoutDashboard, List, Activity, Settings, Bell } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-primary/20 selection:text-primary">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar fixed h-full z-30 hidden md:flex flex-col">
        <div className="p-6 border-b border-sidebar-border/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg ring-1 ring-primary/40">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">HexGuard</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem to="/" icon={<LayoutDashboard size={18} />}>Dashboard</NavItem>
          <NavItem to="/incidents" icon={<List size={18} />}>Incidents</NavItem>
          <NavItem to="/monitoring" icon={<Activity size={18} />}>Live Monitoring</NavItem>
        </nav>

        <div className="p-4 border-t border-sidebar-border/50 space-y-1">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-sidebar-accent">
            <Settings className="mr-2 h-4 w-4" /> Settings
          </Button>
          <div className="pt-4 px-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-mono text-muted-foreground">SYSTEM ONLINE</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative min-h-screen bg-grid">
        <div className="bg-radial-glow absolute inset-0 pointer-events-none" />
        
        {/* Top Bar (Mobile) */}
        <header className="h-16 border-b border-border/40 backdrop-blur-sm sticky top-0 z-20 flex items-center justify-between px-6 md:hidden bg-background/80">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-bold">HexGuard</span>
          </div>
        </header>

        <div className="relative z-10 p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ to, icon, children }: { to: string, icon: React.ReactNode, children: React.ReactNode }) => (
  <NavLink
    to={to}
    className={({ isActive }) => cn(
      "flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium",
      isActive 
        ? "bg-sidebar-primary/10 text-sidebar-primary ring-1 ring-sidebar-primary/20 shadow-[0_0_15px_-3px_rgba(6,182,212,0.15)]" 
        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white"
    )}
  >
    {icon}
    <span>{children}</span>
  </NavLink>
);

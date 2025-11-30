import { useState, useEffect } from 'react';
import { Hero } from '@/components/Hero';
import { EventDetails } from '@/components/EventDetails';
import { GuestForm } from '@/components/GuestForm';
import { AdminPanel } from '@/components/AdminPanel';
import { AdminLogin } from '@/components/AdminLogin';

export function HomePage() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Check if admin is already authenticated
    const isAuth = localStorage.getItem('admin_authenticated') === 'true';
    setIsAdminAuthenticated(isAuth);
  }, []);

  const handleLogin = () => {
    setIsAdminAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAdminAuthenticated(false);
  };

  return (
    <div className="min-h-screen">
      <Hero />
      <EventDetails />
      <GuestForm />
      {isAdminAuthenticated ? (
        <AdminPanel onLogout={handleLogout} />
      ) : (
        <AdminLogin onLogin={handleLogin} />
      )}
      
      {/* Footer */}
      <footer className="bg-secondary/50 py-8 px-4 text-center border-t border-border">
        <p className="text-muted-foreground">
          With love and gratitude, we look forward to celebrating with you
        </p>
          <p className="text-sm text-muted-foreground mt-2">
            Connect with me on instagram{' '}
            <a
              href="https://instagram.com/kabeersandilya"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              @kabeersandilya
            </a>
        </p>
      </footer>
    </div>
  );
}

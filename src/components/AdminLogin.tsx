import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { adminLogin as adminLoginHelper } from '@/lib/api';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const attemptDirectFetchLogin = async (pwd: string) => {
    // Fallback direct fetch to ensure credentials are included and cookie is set
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include', // important so the browser stores the admin cookie
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: pwd }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: 'Login failed' }));
      throw new Error(body.error || `Login failed (${res.status})`);
    }
    return res.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setIsLoading(true);

    try {
      // Primary: use centralized helper if available
      if (typeof adminLoginHelper === 'function') {
        await adminLoginHelper(password);
      } else {
        // Fallback to direct fetch if helper missing
        await attemptDirectFetchLogin(password);
      }

      // On success, update state and local storage
      localStorage.setItem('admin_authenticated', 'true');
      toast.success('Welcome! Access granted.');
      setPassword('');
      onLogin();
    } catch (err: any) {
      // This block now correctly handles only the failure case
      console.error('Admin login failed:', err);
      toast.error(err?.message || 'Incorrect password. Please try again.');
      setPassword('');
      // Ensure local storage is clean on failure
      localStorage.removeItem('admin_authenticated');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-12 px-4 bg-secondary/20 border-t border-border">
      <div className="max-w-md mx-auto">
        <Card className="p-8 bg-card border-2 border-border">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Admin Access
            </h2>
            <p className="text-muted-foreground text-sm">
              Enter password to view guest statistics and export data
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              disabled={!password || isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Verifying...' : 'Access Admin Panel'}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

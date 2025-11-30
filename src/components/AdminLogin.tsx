import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { adminLogin } from '@/lib/api';

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await adminLogin(password);
      localStorage.setItem('admin_authenticated', 'true');
      toast.success('Welcome! Access granted.');
      onLogin();
    } catch (err: any) {
      console.error('Admin login failed:', err);
      toast.error(err.message || 'Incorrect password. Please try again.');
      setPassword('');
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
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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

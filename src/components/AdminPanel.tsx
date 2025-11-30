import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Download, FileSpreadsheet, Users, LogOut } from 'lucide-react';
import { getGuests, getGuestStats, exportGuestsCSV } from '@/lib/db';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

interface AdminPanelProps {
  onLogout: () => void;
}

export function AdminPanel({ onLogout }: AdminPanelProps) {
  const [isExporting, setIsExporting] = useState(false);

  // Fetch guest count / stats
  const { data: guestStats } = useQuery({
    queryKey: ['guest-stats'],
    queryFn: async () => {
      return getGuestStats();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch full guest list (admin only)
  const { data: guests, isLoading: guestsLoading, refetch: refetchGuests } = useQuery({
    queryKey: ['guests'],
    queryFn: async () => {
      return getGuests();
    },
    enabled: true,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      console.log('Starting CSV export (client-side via MongoDB Data API)...');
      const csv = await exportGuestsCSV();

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `anniversary-guests-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Guest list exported successfully!');
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error?.message || 'Failed to export guest list');
    } finally {
      setIsExporting(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Use fetch directly and include credentials so the admin_token cookie is sent and cleared properly
      const res = await fetch('/api/admin/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        console.warn('Logout returned non-OK:', body);
      }

      // Clear local client state regardless (server should clear cookie)
      localStorage.removeItem('admin_authenticated');
      toast.success('Logged out successfully');
      onLogout();
    } catch (err) {
      console.error('Logout failed', err);
      // Best-effort cleanup
      localStorage.removeItem('admin_authenticated');
      toast.success('Logged out');
      onLogout();
    }
  };

  return (
    <section className="py-12 px-4 bg-secondary/20 border-t border-border">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 relative">
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="absolute right-0 top-0 gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Event Management
          </h2>
          <div className="w-16 h-1 bg-primary mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Statistics Card */}
          <Card className="p-6 bg-card border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <Users className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-card-foreground">Guest Statistics</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Total RSVPs</span>
                <span className="text-2xl font-bold text-primary">
                  {guestStats?.totalGuests ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Adults</span>
                <span className="text-xl font-semibold text-card-foreground">
                  {guestStats?.totalAdults ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border">
                <span className="text-muted-foreground">Children</span>
                <span className="text-xl font-semibold text-card-foreground">
                  {guestStats?.totalChildren ?? 0}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 bg-primary/10 px-3 rounded-lg mt-4">
                <span className="font-semibold text-card-foreground">Total Attendees</span>
                <span className="text-2xl font-bold text-primary">
                  {guestStats?.totalAttendees ?? 0}
                </span>
              </div>
            </div>
          </Card>

          {/* Export Card */}
          <Card className="p-6 bg-card border-2 border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileSpreadsheet className="w-8 h-8 text-primary" />
              <h3 className="text-xl font-semibold text-card-foreground">Export Data</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Download all guest RSVPs as a CSV file for easy management in Excel or Google Sheets.
            </p>
            <div className="space-y-3">
              <Button
                onClick={handleExport}
                disabled={isExporting || !guestStats?.totalGuests}
                size="lg"
                className="w-full gap-2"
              >
                {isExporting ? (
                  'Exporting...'
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Export to CSV
                  </>
                )}
              </Button>

              <div className="mt-4">
                <Button
                  onClick={() => {
                    if (typeof refetchGuests === 'function') {
                      refetchGuests();
                      toast.success('Refetching guest list...');
                    }
                  }}
                  variant="ghost"
                  size="sm"
                  className="w-full"
                >
                  Refresh guest list
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Includes: Name, Email, Phone, Guest Count, Message, and RSVP Date
            </p>
          </Card>
        </div>

        {/* Guests list table */}
        <div className="mt-8">
          <Card className="p-6 bg-card border-2 border-border">
            <h3 className="mb-4 text-lg font-semibold">All RSVPs</h3>
            {guestsLoading ? (
              <div>Loading guests...</div>
            ) : !guests || guests.length === 0 ? (
              <div className="text-muted-foreground">No RSVPs yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm table-auto">
                  <thead>
                    <tr className="text-left border-b border-border">
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Phone</th>
                      <th className="py-2">Adults</th>
                      <th className="py-2">Children</th>
                      <th className="py-2">Total</th>
                      <th className="py-2">Message</th>
                      <th className="py-2">RSVP Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((g: any) => (
                      <tr key={g._id || g.id || g.email} className="border-b border-border align-top">
                        <td className="py-3 pr-4">{g.name}</td>
                        <td className="py-3 pr-4">{g.email}</td>
                        <td className="py-3 pr-4">{g.phone || '-'}</td>
                        <td className="py-3 pr-4">{g.adults ?? 0}</td>
                        <td className="py-3 pr-4">{g.children ?? 0}</td>
                        <td className="py-3 pr-4">{(g.adults || 0) + (g.children || 0)}</td>
                        <td className="py-3 pr-4 max-w-xs truncate">{g.message || '-'}</td>
                        <td className="py-3 pr-4">{g.created_at ? new Date(g.created_at).toLocaleString() : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}

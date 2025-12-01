import { useState, useEffect } from 'react';
import { Hero } from '../components/Hero';
import { EventDetails } from '../components/EventDetails';
import { GuestForm } from '../components/GuestForm';
import { AdminLogin } from '../components/AdminLogin';
import { AdminPanel } from '../components/AdminPanel';
import { verifyAdminSession } from '../lib/auth';

export function HomePage() {
  const [isAdmin, setIsAdmin] = useState(false); // Default to false
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // Only verify with the server if localStorage thinks we are an admin
      if (localStorage.getItem('admin_authenticated') === 'true') {
        const isSessionValid = await verifyAdminSession();
        if (isSessionValid) {
          // Only set isAdmin to true if the session is confirmed valid
          setIsAdmin(true);
        } else {
          // If server session is invalid, clear local state
          localStorage.removeItem('admin_authenticated');
          // isAdmin is already false, so no state change needed
        }
      }
      setIsVerifying(false);
    };

    checkSession();
  }, []); // The empty dependency array ensures this runs only once on mount

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    setIsAdmin(false);
  };

  return (
    <main>
      <Hero />
      {isVerifying ? (
        // While verifying, show a placeholder or nothing under the Hero
        <div className="h-[50vh]" /> // Adjust height as needed
      ) : isAdmin ? (
        // If admin, show the admin panel
        <AdminPanel onLogout={handleLogout} />
      ) : (
        // If not admin, show the user view
        <section id="user-view">
          <EventDetails />
          <GuestForm />
          <AdminLogin onLogin={handleLogin} />
        </section>
      )}
    </main>
  );
}
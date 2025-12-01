/**
 * Verifies the current admin session by making a request to a protected endpoint.
 * This is used on app load to synchronize the client-side auth state with the
 * server-side session (which is cookie-based).
 *
 * @returns {Promise<boolean>} A promise that resolves to true if the session is valid, and false otherwise.
 */
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/verify', {
      method: 'GET',
      credentials: 'include', // Ensures the browser sends the admin cookie
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.ok;
  } catch (error) {
    console.error('Admin session verification failed:', error);
    return false;
  }
}
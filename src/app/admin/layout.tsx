import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import AdminNav from '@/components/admin/AdminNav';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('fibrarte-token')?.value;
  const isAuthenticated = token ? verifyToken(token) : null;

  return (
    <div className="min-h-screen bg-beige">
      {isAuthenticated && <AdminNav />}
      <div className={isAuthenticated ? 'pt-16' : ''}>{children}</div>
    </div>
  );
}

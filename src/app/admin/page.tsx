import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

export default function AdminPage() {
  const cookieStore = cookies();
  const token = cookieStore.get('fibrarte-token')?.value;

  if (token) {
    const decoded = verifyToken(token);
    if (decoded) {
      redirect('/admin/dashboard');
    }
  }

  redirect('/admin/login');
}

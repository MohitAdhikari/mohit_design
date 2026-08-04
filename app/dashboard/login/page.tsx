import { Suspense } from 'react';
import LoginForm from '@/components/dashboard/LoginForm';

export default function DashboardLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-2xl font-black tracking-tight">PHONEOCEAN</p>
          <p className="text-xs text-white/50 font-mono uppercase tracking-wider">Dashboard Login</p>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

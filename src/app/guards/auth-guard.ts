import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const AuthGuard: CanActivateFn = () => {
  const router = inject(Router);

  // 👇 ป้องกัน crash ตอน SSR
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) {
    // SSR: ปล่อยผ่านเพื่อไม่ให้ sessionStorage พัง
    return true;
  }

  const token = sessionStorage.getItem('token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};

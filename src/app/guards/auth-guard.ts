import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Login } from '../services/login';

export const AuthGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const loginService = inject(Login);

  // ป้องกัน SSR crash
  if (typeof window === 'undefined') return true;

  try {
    // เรียก API /me เพื่อเช็ค token ใน HttpOnly cookie
    const user = await firstValueFrom(loginService.getCurrentUser());
    if (user) {
      return true;
    } else {
      router.navigate(['/login']);
      return false;
    }
  } catch {
    router.navigate(['/login']);
    return false;
  }
};

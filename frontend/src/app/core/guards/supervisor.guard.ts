import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const supervisorGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.getUser();
  if (user?.role === 'supervisor' && user?.status === 'approved') return true;
  router.navigate(['/dashboard']);
  return false;
};

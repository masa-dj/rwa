import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const redirectIfLoggedGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
        const user = authService.getUser();
        if (user?.status === 'approved') {
            router.navigate(['/dashboard']);
        } else {
            router.navigate(['/status']);
        }
        return false;
    }

    return true;
};

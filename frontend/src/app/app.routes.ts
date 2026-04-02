import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./auth/login/login').then((m) => m.LoginComponent),
        title: 'Complaint Portal - Login'
    },
    {
        path: 'register',
        loadComponent: () => import('./auth/register/register').then((m) => m.RegisterComponent),
        title: 'Complaint Portal - Register'
    },
    {
        path: 'student-dashboard',
        loadComponent: () =>
            import('./student-dashboard/student-dashboard').then((m) => m.StudentDashboardComponent),
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'STUDENT' },
        title: 'Complaint Portal - Student Dashboard'
    },
    {
        path: 'admin',
        loadComponent: () => import('./admin-dashboard/admin-dashboard').then((m) => m.AdminDashboardComponent),
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'ADMIN' },
        title: 'Complaint Portal - Admin Dashboard'
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    {
        path: 'super-admin',
        loadComponent: () =>
            import('./super-admin/super-admin-dashboard/super-admin-dashboard').then((m) => m.SuperAdminDashboardComponent),
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'SUPER_ADMIN' },
        title: 'Complaint Portal - Super Admin'
    },
];

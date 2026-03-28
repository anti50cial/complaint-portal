import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'Complaint Portal - Login' },
    { path: 'register', component: RegisterComponent, title: 'Complaint Portal - Register' },
    {
        path: 'student-dashboard',
        component: StudentDashboardComponent,
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'STUDENT' },
        title: 'Complaint Portal - Student Dashboard'
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'ADMIN' },
        title: 'Complaint Portal - Admin Dashboard'
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];

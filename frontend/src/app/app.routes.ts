import { Routes } from '@angular/router';
import { StudentDashboardComponent } from './student-dashboard/student-dashboard';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    {
        path: 'student-dashboard',
        component: StudentDashboardComponent,
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'STUDENT' }
    },
    {
        path: 'admin',
        component: AdminDashboardComponent,
        canActivate: [ authGuard, roleGuard ],
        data: { role: 'ADMIN' }
    },
    { path: '', redirectTo: 'login', pathMatch: 'full' }
];

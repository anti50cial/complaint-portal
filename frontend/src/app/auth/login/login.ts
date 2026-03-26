import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule
    ],
    templateUrl: './login.html',
    styleUrl: './login.css'
})
export class LoginComponent {
    loginForm: FormGroup;
    loading = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private message: NzMessageService,
        private router: Router
    ) {
        this.loginForm = this.fb.group({
            email: [ '', [ Validators.required, Validators.email ] ],
            password: [ '', [ Validators.required, Validators.minLength(6) ] ]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            this.loading.set(true);
            this.authService.login(this.loginForm.value).subscribe({
                next: (res) => {
                    this.message.success('Login successful');
                    const role = res.user.role;
                    if (role === 'ADMIN') {
                        this.router.navigate([ '/admin' ]);
                    } else {
                        this.router.navigate([ '/student-dashboard' ]);
                    }
                },
                error: (err) => {
                    const errorMsg = err.error?.message || 'Invalid email or password';
                    this.message.error(errorMsg);
                    this.loading.set(false);
                }
            });
        } else {
            Object.values(this.loginForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}

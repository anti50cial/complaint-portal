import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink,
        NzFormModule,
        NzInputModule,
        NzButtonModule,
        NzCardModule,
        NzSelectModule
    ],
    templateUrl: './register.html',
    styleUrl: './register.css'
})
export class RegisterComponent {
    registerForm: FormGroup;
    loading = signal(false);

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private message: NzMessageService,
        private router: Router
    ) {
        this.registerForm = this.fb.group({
            name: [ '', [ Validators.required, Validators.minLength(2) ] ],
            email: [ '', [ Validators.required, Validators.email ] ],
            password: [ '', [ Validators.required, Validators.minLength(6) ] ],
            confirmPassword: [ '', [ Validators.required ] ],
            role: [ 'STUDENT', [ Validators.required ] ]
        }, { validators: this.passwordMatchValidator });
    }

    passwordMatchValidator(g: FormGroup) {
        return g.get('password')?.value === g.get('confirmPassword')?.value
            ? null : { 'mismatch': true };
    }

    onSubmit(): void {
        if (this.registerForm.valid) {
            this.loading.set(true);
            this.authService.register(this.registerForm.value).subscribe({
                next: () => {
                    this.message.success('Registration successful. Please login.');
                    this.router.navigate([ '/login' ]);
                },
                error: (err) => {
                    const errorMsg = err.error?.message || 'Registration failed';
                    this.message.error(errorMsg);
                    this.loading.set(false);
                }
            });
        } else {
            Object.values(this.registerForm.controls).forEach(control => {
                if (control.invalid) {
                    control.markAsDirty();
                    control.updateValueAndValidity({ onlySelf: true });
                }
            });
        }
    }
}

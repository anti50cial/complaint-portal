import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { ComplaintService, Complaint } from '../complaint.service';
import { PlatformService } from '../core/services/platform.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzTableModule,
    NzTagModule,
    NzIconModule,
    NzModalModule
  ],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css'
})
export class StudentDashboardComponent implements OnInit {

  private fb = inject(FormBuilder);
  private complaintService = inject(ComplaintService);
  private message = inject(NzMessageService);
  private platform = inject(PlatformService);
  private authService = inject(AuthService);
  private modal = inject(NzModalService);

  currentUser = this.authService.currentUser();
  complaintForm: FormGroup;
  complaints = signal<Complaint[]>([]);
  loading = signal(false);
  constructor() {
    this.complaintForm = this.fb.group({
      description: [ '', [ Validators.required, Validators.minLength(10) ] ]
    });
  }

  ngOnInit(): void {
    if (this.platform.isBrowser()) {
      this.loadComplaints();
    }
  }

  loadComplaints(): void {
    this.loading.set(true);
    this.complaintService.getMyComplaints().subscribe({
      next: (data: Complaint[]) => {
        this.complaints.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to load complaints';
        this.message.error(errorMsg);
        this.loading.set(false);
      }
    });
  }

  submitComplaint(): void {
    if (this.complaintForm.valid) {
      this.loading.set(true);
      this.complaintService.createComplaint(this.complaintForm.value).subscribe({
        next: (res: Complaint) => {
          this.message.success('Complaint submitted successfully');
          this.complaintForm.reset();
          this.loadComplaints();
        },
        error: () => {
          this.message.error('Failed to submit complaint');
          this.loading.set(false);
        }
      });
    } else {
      Object.values(this.complaintForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }

  viewDetails(complaint: Complaint): void {
    const adminCommentHtml = complaint.adminComment
      ? `<div style="margin-top: 15px; padding: 12px; background-color: #fffbe6; border: 1px solid #ffe58f; border-radius: 6px;">
           <p style="margin-bottom: 4px; color: #856404;"><strong>Admin Feedback:</strong></p>
           <p style="white-space: pre-wrap; margin-bottom: 0; color: #333; font-style: italic;">"${complaint.adminComment}"</p>
         </div>`
      : '';

    const seenByHtml = complaint.views?.length
      ? `<div style="margin-top: 10px; font-size: 12px; color: #888;">
          <strong>Seen by:</strong> ${complaint.views.map(v => v.admin.name).join(', ')}
         </div>`
      : '';

    this.modal.info({
      nzTitle: `Complaint Details`,
      nzContent: `<div style="padding-top: 10px;">
                    <p style="margin-bottom: 8px;"><strong>Status:</strong> ${complaint.status}</p>
                    <p style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
                    ${seenByHtml}
                    <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                    <p style="white-space: pre-wrap; color: #555;">${complaint.description}</p>
                    ${adminCommentHtml}
                  </div>`,
      nzMaskClosable: true,
      nzFooter: null,
      nzWidth: 600
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Pending': return 'red';
      case 'Seen': return 'blue';
      case 'Resolved': return 'green';
      default: return 'default';
    }
  }
}

import { Component, OnInit, signal, inject, ViewChild, ElementRef, TemplateRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { ComplaintService, Complaint } from '../complaint.service';
import { PlatformService } from '../core/services/platform.service';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    NzTableModule,
    NzTagModule,
    NzDropDownModule,
    NzButtonModule,
    NzIconModule,
    NzMenuModule,
    NzModalModule,
    NzInputModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private observer: IntersectionObserver | null = null;
  private viewedIds = new Set<string>();

  private complaintService = inject(ComplaintService);
  private message = inject(NzMessageService);
  private platform = inject(PlatformService);
  private authService = inject(AuthService);
  private modal = inject(NzModalService);

  @ViewChild('commentTemplate') commentTemplate!: TemplateRef<any>;
  @ViewChild('commentInput', { static: false }) commentInput!: ElementRef<HTMLTextAreaElement>;
  currentUser = this.authService.currentUser();
  complaints = signal<Complaint[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    if (this.platform.isBrowser()) {
      this.loadAllComplaints();
    }
  }

  loadAllComplaints(): void {
    this.loading.set(true);
    this.complaintService.getComplaints().subscribe({
      next: (data: Complaint[]) => {
        this.complaints.set(data);
        this.loading.set(false);
        // Re-setup observer after data load
        setTimeout(() => this.setupObserver(), 500);
      },
      error: (err) => {
        const errorMsg = err.error?.message || 'Failed to load complaints';
        this.message.error(errorMsg);
        this.loading.set(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.platform.isBrowser()) {
      this.setupObserver();
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private setupObserver(): void {
    if (!this.platform.isBrowser()) return;

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('data-id');
          if (id && !this.viewedIds.has(id)) {
            const complaint = this.complaints().find(c => c.id === id);
            // Only mark as viewed if it's pending or not already viewed by current user
            const alreadySeen = complaint?.views?.some(v => v.admin.email === this.currentUser?.email);

            if (complaint && !alreadySeen) {
              this.markAsViewed(id);
            } else if (id) {
              this.viewedIds.add(id);
            }
          }
        }
      });
    }, { threshold: 0.1 });

    const rows = document.querySelectorAll('tr[data-id]');
    rows.forEach(row => this.observer?.observe(row));
  }

  private markAsViewed(id: string): void {
    if (this.viewedIds.has(id)) return;
    this.viewedIds.add(id);

    this.complaintService.markAsViewed(id).subscribe({
      next: (updated) => {
        // Update the signal with the new status/views if needed
        const current = this.complaints();
        const index = current.findIndex(c => c.id === id);
        if (index !== -1) {
          current[ index ] = updated;
          this.complaints.set([ ...current ]);
        }
      },
      error: (err) => {
        console.error('Failed to mark as viewed', err);
        this.viewedIds.delete(id); // Retry later if needed
      }
    });
  }

  currentComment = '';

  updateStatus(complaint: Complaint, status: 'Seen' | 'Resolved'): void {
    this.currentComment = complaint.adminComment || '';

    this.modal.confirm({
      nzTitle: `Update Status to ${status}`,
      nzContent: this.commentTemplate,
      nzOnOk: () => {
        const finalComment = this.commentInput.nativeElement.value || '';

        this.loading.set(true);
        this.complaintService.updateComplaintStatus(complaint.id, status, finalComment).subscribe({
          next: () => {
            this.message.success(`Status updated to ${status}`);
            this.loadAllComplaints();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to update status';
            this.message.error(errorMsg);
            this.loading.set(false);
          }
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
  }

  viewDetails(complaint: Complaint): void {
    const adminCommentHtml = complaint.adminComment
      ? `<div style="margin-top: 15px; padding: 12px; background-color: #f0f5ff; border: 1px solid #adc6ff; border-radius: 6px;">
                 <p style="margin-bottom: 4px; color: #1d39c4;"><strong>Our Comment:</strong></p>
                 <p style="white-space: pre-wrap; margin-bottom: 0; color: #333;">${complaint.adminComment}</p>
               </div>`
      : '';

    const seenByHtml = complaint.views?.length
      ? `<div style="margin-top: 10px; font-size: 12px; color: #888;">
          <strong>Seen by:</strong> ${complaint.views.map(v => v.admin.name).join(', ')}
         </div>`
      : '';

    const studentInfoHtml = complaint.student
      ? `<p style="margin-bottom: 8px;"><strong>Submitted by:</strong> ${complaint.student.name} (${complaint.student.email})</p>`
      : '';

    this.modal.info({
      nzTitle: `Complaint Details`,
      nzContent: `<div style="padding-top: 10px;">
                            ${studentInfoHtml}
                            <p style="margin-bottom: 8px;"><strong>Status:</strong> ${complaint.status}</p>
                            <p style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(complaint.createdAt).toLocaleString()}</p>
                            ${seenByHtml}
                            <hr style="margin: 15px 0; border: 0; border-top: 1px solid #eee;">
                            <p style="white-space: pre-wrap; color: #333; line-height: 1.6;">${complaint.description}</p>
                            ${adminCommentHtml}
                        </div>`,
      nzMaskClosable: true,
      nzFooter: null,
      nzWidth: 700
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

  // Sorting function for the status column
  sortByStatus = (a: Complaint, b: Complaint) => a.status.localeCompare(b.status);
}

import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../auth/auth.service';
import { PlatformService } from '../../core/services/platform.service';
import { SuperAdminService, SuperAdminUser, SuperAdminComplaint } from '../super-admin.service';
import { FeedbackBannerComponent } from '../../shared/ui/feedback-banner/feedback-banner';
import { DialogShellComponent } from '../../shared/ui/dialog-shell/dialog-shell';
import { StatusBadgeComponent } from '../../shared/ui/status-badge/status-badge';

type ActionType =
  | 'delete-users'
  | 'delete-selected-users'
  | 'delete-complaints'
  | 'delete-selected-complaints'
  | 'reset';

interface ConfirmDialog {
  action: ActionType;
  title: string;
  warning: string;
}

@Component({
  selector: 'app-super-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    SlicePipe,
    ReactiveFormsModule,
    FeedbackBannerComponent,
    DialogShellComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './super-admin-dashboard.html',
  styleUrl: './super-admin-dashboard.css',
})
export class SuperAdminDashboardComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly platform = inject(PlatformService);
  private readonly superAdminService = inject(SuperAdminService);

  currentUser = this.auth.currentUser;

  users = signal<SuperAdminUser[]>([]);
  complaints = signal<SuperAdminComplaint[]>([]);
  loadingUsers = signal(false);
  loadingComplaints = signal(false);

  // Selection state
  selectedUserIds = signal<Set<string>>(new Set());
  selectedComplaintIds = signal<Set<string>>(new Set());

  executing = signal(false);
  feedback = signal<{ type: 'success' | 'error'; text: string } | null>(null);
  confirmDialog = signal<ConfirmDialog | null>(null);

  passwordControl = new FormControl('', [Validators.required, Validators.minLength(1)]);

  ngOnInit(): void {
    if (this.platform.isBrowser()) {
      this.loadUsers();
      this.loadComplaints();
    }
  }

  // ── Data loading ────────────────────────────────────────────────────────

  loadUsers(): void {
    this.loadingUsers.set(true);
    this.superAdminService.getUsers().subscribe({
      next: (data) => {
        this.users.set(data);
        this.selectedUserIds.set(new Set()); // Reset selection on load
        this.loadingUsers.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.feedback.set({ type: 'error', text: err.error?.message ?? 'Failed to load users.' });
        this.loadingUsers.set(false);
      },
    });
  }

  loadComplaints(): void {
    this.loadingComplaints.set(true);
    this.superAdminService.getComplaints().subscribe({
      next: (data) => {
        this.complaints.set(data);
        this.selectedComplaintIds.set(new Set()); // Reset selection on load
        this.loadingComplaints.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.feedback.set({ type: 'error', text: err.error?.message ?? 'Failed to load complaints.' });
        this.loadingComplaints.set(false);
      },
    });
  }

  // ── Selection Logic ──────────────────────────────────────────────────────

  toggleUser(id: string): void {
    this.selectedUserIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAllUsers(): void {
    const allIds = this.users().map((u) => u.id);
    this.selectedUserIds.update((set) => {
      if (set.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  }

  toggleComplaint(id: string): void {
    this.selectedComplaintIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  toggleAllComplaints(): void {
    const allIds = this.complaints().map((c) => c.id);
    this.selectedComplaintIds.update((set) => {
      if (set.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  }

  // ── Confirmation dialog ─────────────────────────────────────────────────

  openConfirm(action: ActionType): void {
    this.passwordControl.reset();
    const configs: Record<ActionType, ConfirmDialog> = {
      'delete-users': {
        action,
        title: '⚠️ Delete All Users',
        warning:
          'This will permanently delete ALL student and admin accounts, along with every complaint they have submitted. This action CANNOT be undone.',
      },
      'delete-selected-users': {
        action,
        title: `⚠️ Delete ${this.selectedUserIds().size} User(s)`,
        warning:
          `This will permanently delete the ${this.selectedUserIds().size} selected student/admin accounts and all their related data. This action CANNOT be undone.`,
      },
      'delete-complaints': {
        action,
        title: '⚠️ Delete All Complaints',
        warning:
          'This will permanently delete EVERY complaint in the system, including all admin comments and view history. This action CANNOT be undone.',
      },
      'delete-selected-complaints': {
        action,
        title: `⚠️ Delete ${this.selectedComplaintIds().size} Complaint(s)`,
        warning:
          `This will permanently delete the ${this.selectedComplaintIds().size} selected complaints and their history. This action CANNOT be undone.`,
      },
      reset: {
        action,
        title: '💀 Reset Application',
        warning:
          'This will destroy EVERYTHING — all complaints, all admin comments, all student and admin accounts. The application will be returned to a blank slate. Only your Super Admin account will survive. This action is PERMANENT and IRREVERSIBLE.',
      },
    };
    this.confirmDialog.set(configs[action]);
  }

  closeConfirm(): void {
    this.confirmDialog.set(null);
    this.passwordControl.reset();
  }

  confirmAction(): void {
    if (this.passwordControl.invalid) {
      this.passwordControl.markAsTouched();
      return;
    }

    const dialog = this.confirmDialog();
    if (!dialog) return;
    const password = this.passwordControl.value ?? '';

    this.executing.set(true);

    let request$;

    switch (dialog.action) {
      case 'delete-users':
        request$ = this.superAdminService.deleteAllUsers(password);
        break;
      case 'delete-selected-users':
        request$ = this.superAdminService.deleteSelectedUsers(Array.from(this.selectedUserIds()), password);
        break;
      case 'delete-complaints':
        request$ = this.superAdminService.deleteAllComplaints(password);
        break;
      case 'delete-selected-complaints':
        request$ = this.superAdminService.deleteSelectedComplaints(Array.from(this.selectedComplaintIds()), password);
        break;
      case 'reset':
        request$ = this.superAdminService.resetApplication(password);
        break;
    }

    request$.subscribe({
      next: (res) => {
        const label =
          dialog.action === 'delete-users' || dialog.action === 'delete-selected-users'
            ? `${res.deleted} user(s)`
            : dialog.action === 'delete-complaints' || dialog.action === 'delete-selected-complaints'
              ? `${res.deleted} complaint(s)`
              : `${res.deleted} user(s) and all complaints`;
        this.feedback.set({ type: 'success', text: `Done. Deleted ${label}.` });
        this.closeConfirm();
        this.executing.set(false);
        this.loadUsers();
        this.loadComplaints();
      },
      error: (err: { error?: { message?: string } }) => {
        this.feedback.set({
          type: 'error',
          text: err.error?.message ?? 'Action failed. Check your password and try again.',
        });
        this.executing.set(false);
      },
    });
  }

  // ── Misc ────────────────────────────────────────────────────────────────

  dismissFeedback(): void {
    this.feedback.set(null);
  }

  logout(): void {
    this.auth.logout();
  }

  updatePassword(event: Event): void {
    const target = event.target;
    if (target instanceof HTMLInputElement) {
      this.passwordControl.setValue(target.value);
    }
  }
}

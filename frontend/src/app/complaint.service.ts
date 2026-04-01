import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { getAppConfig } from './core/config/app-config';

export interface Complaint {
  id: string;
  description: string;
  status: 'Pending' | 'Seen' | 'Resolved';
  createdAt: string;
  student?: {
    email: string;
    name: string;
  };
  adminComment?: string | null;
  views?: Array<{
    admin: {
      name: string;
      email: string;
    };
  }>;
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class ComplaintService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${getAppConfig().apiBaseUrl}/complaints`;

  getComplaints(): Observable<Complaint[]> {
    return this.http.get<ApiResponse<Complaint[]>>(this.apiUrl).pipe(map(res => res.data));
  }

  getMyComplaints(): Observable<Complaint[]> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.apiUrl}/mine`).pipe(map(res => res.data));
  }

  createComplaint(data: { description: string }): Observable<Complaint> {
    return this.http.post<ApiResponse<Complaint>>(this.apiUrl, data).pipe(map(res => res.data));
  }

  updateComplaintStatus(id: string, status: 'Seen' | 'Resolved', adminComment?: string): Observable<Complaint> {
    return this.http.patch<ApiResponse<Complaint>>(`${this.apiUrl}/${id}/status`, { status, adminComment }).pipe(map(res => res.data));
  }

  markAsViewed(id: string): Observable<Complaint> {
    return this.http.patch<ApiResponse<Complaint>>(`${this.apiUrl}/${id}/view`, {}).pipe(map(res => res.data));
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'Reviewed' | 'Resolved';
  createdAt: string;
  student?: {
    email: string;
    name: string;
  };
  adminComment?: string | null;
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
  private apiUrl = '/api/complaints';

  constructor(private http: HttpClient) { }

  getComplaints(): Observable<Complaint[]> {
    return this.http.get<ApiResponse<Complaint[]>>(this.apiUrl).pipe(map(res => res.data));
  }

  getMyComplaints(): Observable<Complaint[]> {
    return this.http.get<ApiResponse<Complaint[]>>(`${this.apiUrl}/mine`).pipe(map(res => res.data));
  }

  createComplaint(data: { title: string, description: string }): Observable<Complaint> {
    return this.http.post<ApiResponse<Complaint>>(this.apiUrl, data).pipe(map(res => res.data));
  }

  updateComplaintStatus(id: string, status: 'Reviewed' | 'Resolved', adminComment?: string): Observable<Complaint> {
    return this.http.patch<ApiResponse<Complaint>>(`${this.apiUrl}/${id}/status`, { status, adminComment }).pipe(map(res => res.data));
  }
}

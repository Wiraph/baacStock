import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  private readonly apiUrl = 'https://localhost:7089/api/approve';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object
  ) { }

  getStockApprove(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/approve`, {
      headers: this.createAuthHeaders()
    })
  }

  approveIssue(id: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/create/${id}`,
      null,
      { headers }
    );
  }

  notapprove(id: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/notapproved/${id}`,
      null,
      { headers }
    );
  }

  refuseList(stkNote: string): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.put<any>(
      `${this.apiUrl}/refuse/${stkNote}`, null, {headers}
    );
  }

  confirmStock(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm`, data, {
      headers: this.createAuthHeaders()
    });
  }

  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class StocktransferService {
  private apiUrl = 'https://localhost:7089/api/stocktransfer';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  transferRequest(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, payload, { headers: this.createAuthHeaders() });
  }

  transferCancel(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/cancel`, payload, { headers: this.createAuthHeaders() });
  }

  transferApprove(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/approve`, payload, { headers: this.createAuthHeaders() });
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

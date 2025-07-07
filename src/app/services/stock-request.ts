import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class StockRequestService {
  private apiUrl = 'https://localhost:7089/api/stockrequest';

  constructor(private http: HttpClient,@Inject(PLATFORM_ID) private platformId: Object) {}

  submitRequest(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, payload, {headers: this.createAuthHeaders()});
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

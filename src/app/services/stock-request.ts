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

  submitRequest(stkNote: string ,payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/sale_stock/${stkNote}`, payload, {headers: this.createAuthHeaders()});
  }

  transferRequest(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/transfer`, payload, {headers: this.createAuthHeaders()});
  }

  stockRequest(payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/request`,payload, {headers:this.createAuthHeaders()});
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

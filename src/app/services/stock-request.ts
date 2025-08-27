import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class StockRequestService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/stockrequest`;

  constructor(private readonly http: HttpClient,@Inject(PLATFORM_ID) private readonly platformId: Object) {}

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

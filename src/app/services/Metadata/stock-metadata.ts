import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/StockMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly plateformId: Object
  ) { }

  stkTyps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stktypes`, {
      headers: this.createAuthHeaders()
    });
  }

  accTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.accTypes}/acctypes`, {
      headers: this.createAuthHeaders()
    });
  }

  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.plateformId)) {
      token = sessionStorage.getItem('token') || ''
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}

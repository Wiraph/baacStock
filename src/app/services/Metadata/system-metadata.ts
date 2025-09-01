import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SystemMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/AddressMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  sysCfg(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/syscfg`, {
      headers: this.createAuthHeaders()
    });
  }

  remCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/remcode`, {
      headers: this.createAuthHeaders()
    });
  }

  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    };
    return new HttpHeaders ({
      Authurization: `Bearer ${token}`
    });
  }
}

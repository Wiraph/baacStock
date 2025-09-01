import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/CustomerMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  cusTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/custypes`, {
      headers: this.createAuthHeaders()
    });
  }

  docTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctypes`, {
      headers: this.createAuthHeaders()
    });
  }

  titles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/titles`, {
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

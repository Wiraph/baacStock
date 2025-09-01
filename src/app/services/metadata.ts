import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Metadata`;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) { }

  getBranch(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/branch`, {
      headers: this.createAuthHeaders()
    });
  }

  getLevel(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/level`, {
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

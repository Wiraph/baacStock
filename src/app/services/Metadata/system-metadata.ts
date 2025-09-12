import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SystemMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/SystemMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  sysCfg(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/syscfg`, {
      withCredentials: true
    });
  }

  remCode(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/remcode`, {
      withCredentials: true
    });
  }
}

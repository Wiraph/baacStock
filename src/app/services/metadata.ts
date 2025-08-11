import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private readonly apiUrl = 'https://localhost:7089/api/Metadata';

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly encryped: EncryptionService
  ) { }

  getCustype(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/custype`, {
      headers: this.createAuthHeaders()
    });
  }

  getDoctype(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctype`, {
      headers: this.createAuthHeaders()
    });
  }

  getTitle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/title`, {
      headers: this.createAuthHeaders()
    });
  }

  getProvince(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/province`, {
      headers: this.createAuthHeaders()
    });
  }

  getAumphor(prvCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aumphor/${prvCode}`, {
      headers: this.createAuthHeaders()
    });
  }

  getTumbons(prvCode: string, ampcode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tumbons/${prvCode}/${ampcode}`, {
      headers: this.createAuthHeaders()
    });
  }

  getAcctypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/acctyps`, {
      headers: this.createAuthHeaders()
    });
  }

  getStaTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stktypes`, {
      headers: this.createAuthHeaders()
    });
  }

  getSyscfg(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/syscfg`, {
      headers: this.createAuthHeaders()
    })
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

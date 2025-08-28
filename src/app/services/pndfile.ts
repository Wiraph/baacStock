import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

export interface PndFileCheck {
  path: string;
  available: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class Pndfile {

  private readonly apiUrl = `${environment.dotnetApiUrl}/api/pndfile`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: object,
    private readonly encryptionService: EncryptionService
  ) { }

  checkFiles(fileNames: string[]): Observable<PndFileCheck[]> {
    return this.http.post<PndFileCheck[]>(`${this.apiUrl}/check`, fileNames, {
      headers: this.createAuthHeaders()
    });
  }

  download(payload: any): Observable<Blob> {
    const encrypPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/download`, encrypPayload, {
      headers: this.createAuthHeaders(),
      responseType: 'blob'
    })
  }

   private createAuthHeaders() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../encryption.service';

@Injectable({
  providedIn: 'root'
})
export class SystemMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/SystemMetadata`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
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

  branch(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/data`, {
      withCredentials: true
    });
  }

  Province(payload: any): Observable<any[]> {
    const encryptedPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/brprv`, encryptedPayload, {
      withCredentials: true
    });
  }

  BrBranch(payload: any): Observable<any[]> {
    const encryptedPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/brbranch`, encryptedPayload, {
      withCredentials: true
    });
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyscfgService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/syscfg`;

  constructor(
    private readonly http: HttpClient,
    private readonly encryptService: EncryptionService
  ) { }

  updateSyscfg(payload: any): Observable<any[]> {
    const encryptedPayload = this.encryptService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/update`, encryptedPayload, { withCredentials: true });
  }
}

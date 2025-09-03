import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class Login {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/auth`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionServcie: EncryptionService
  ) { }

  login(username: string, password: string): Observable<any[]> {
    const payload = {
      Username: username,
      Password: password
    }
    const encryptionPayload = this.encryptionServcie.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/login`, encryptionPayload , { withCredentials: true });
  }

  getCurrentUser() {
    return this.http.get<any>(`${this.apiUrl}/me`, { withCredentials: true });
  }
}

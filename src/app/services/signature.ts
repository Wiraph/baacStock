import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';
import { EncryptionService } from './encryption.service';



@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Signature`;

  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  getSignatures(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`, {
      withCredentials: true
    })
  }

  // เรียก API เพิ่มลายเซ็น
  createSignature(request: any): Observable<any[]> {
    const encryptedPayload = this.encryptionService.encrypPayload(request);
    return this.http.post<any[]>(`${this.apiUrl}/create`, encryptedPayload , { withCredentials: true });
  }
}

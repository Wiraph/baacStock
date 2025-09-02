import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { EncryptionService } from '../encryption.service';

@Injectable({
  providedIn: 'root'
})
export class AddressMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/AddressMetadata`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  getProvince(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/provinces`, {
      withCredentials: true
    });
  }

  getAumphor(prvCode: string): Observable<any[]> {
    const payload = {
      prvCode: prvCode
    }
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/aumphors`, encryptionPayload, {
      withCredentials: true
    });
  }

  getTumbon(prvCode: string, ampcode: string): Observable<any[]> {
    const payload = {
      ampCode: ampcode,
      prvCode: prvCode
    }
    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post<any[]>(`${this.apiUrl}/tumbons`, encryptionPayload, {
      withCredentials: true
    });
  }
}

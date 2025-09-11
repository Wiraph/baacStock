import { HttpClient } from '@angular/common/http';
<<<<<<< HEAD
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
=======
import { Injectable } from '@angular/core';
>>>>>>> c5dd85f69f1dbf7355e4b7f2843a194a25e79895
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ApproveService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/approve`;

  constructor(
    private readonly http: HttpClient,
    private readonly encryption: EncryptionService,
  ) { }

  getStockApprove(payloadRequst: any): Observable<any[]> {
    const encrypPayload = this.encryption.encrypPayload(payloadRequst);
    return this.http.post<any[]>(`${this.apiUrl}/stktransai`, encrypPayload, { withCredentials: true });
  }

  confirmStock(payload: any): Observable<any> {
    const encrypPayload = this.encryption.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/confirm`, encrypPayload, { withCredentials: true });
  }
}

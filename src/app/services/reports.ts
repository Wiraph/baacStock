import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class Reports {
  private readonly apiUrl = `${environment.dotnetApiUrl}/report`;
  constructor(
    private readonly http: HttpClient,
    private readonly encrypt: EncryptionService
  ) { }

  downloadApproveReport(payload: any): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/approve-report`, payload, {withCredentials:true, responseType: 'blob'});
  }
}

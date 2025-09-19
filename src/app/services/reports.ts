import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

export interface StockReportDto {
  Division: string;
  Prov: string;
  Br: string;
  DateStart: string;
  DateEnd: string;
  TypeExport: string;
}

@Injectable({
  providedIn: 'root'
})
export class Reports {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Report`;
  constructor(
    private readonly http: HttpClient,
    private readonly encrypt: EncryptionService
  ) { }

  downloadApproveReport(payload: any): Observable<Blob> {
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/approve-report`, encrypPayload, {withCredentials:true, responseType: 'blob'});
  }

  LoadFileMenu3(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu3`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu4(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu4`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu5(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu5`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu6(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu6`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu7(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu7`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu8(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu8`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu9(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu9`, encrypPayload, { withCredentials: true });
  }

  LoadFileMenu10(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu10`, encrypPayload, { withCredentials: true });
  }

  StockHolder(payload: any): Observable<any>{
    const encrypPayload = this.encrypt.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stockholder`, encrypPayload, { withCredentials: true });
  }
}

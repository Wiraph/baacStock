import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

export interface StockReportDto  {
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
export class Reportservice {

  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Report`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryption: EncryptionService
  ) { }


  LoadFileMenu3(payload: any): Observable<any>{
    const encrypPayload = this.encryption.encrypPayload(payload);
    return this.http.post<any>(`${this.apiUrl}/stock-report-menu3`, encrypPayload, { withCredentials: true });
  }
}

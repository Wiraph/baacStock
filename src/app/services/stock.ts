import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environment';


export interface StockItem {
  brCode: string;
  stkNote: string;
  stkNoteo?: string;
  StkRemcode?: string;
  stkNostart?: string;
  stkNostop?: string;
  stkUniT?: number;
  stkValue?: number;
  stkStatus?: string;
  stkDateInput?: string;
  statusDesc?: string;
  stkOwniD?: string;
  fullname?: string;
  stkPayType?: string;
  stkAcctype?: string;
  stkAccno?: string;
  stkAccname?: string;
  datetimeup?: string;
}

export interface StockType {
  typeCode: string;
  typeName: string;
}


@Injectable({
  providedIn: 'root'
})
export class StockService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Stock`;

  constructor(
    private readonly http: HttpClient,
    private readonly encrypt: EncryptionService
  ) { }

  stockManage(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/manage`, encodePayload, {
      withCredentials: true
    });
  }

  getStockDetail(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/stkdetail`, encodePayload, {
      withCredentials: true
    });
  }

  stockLost(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/stklost`, encodePayload, {
      withCredentials: true
    });
  }

  stockTransfer(requestPayload: any): Observable<any[]> {
    const encryptedPayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/transfer`, encryptedPayload, { withCredentials: true });
  }

  blockStock(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/block`, encodePayload, { withCredentials: true });
  }

  detailApprove(requestPayload: any): Observable<any[]> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/approvedetail`, encodePayload, { withCredentials: true });
  }

  GenPdfStockReport(requestPayload: any): Observable<Blob> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post(`${this.apiUrl}/pdf`, encodePayload, {withCredentials: true, responseType: 'blob'});
  }

  GenExcelStockReport(requestPayload: any): Observable<Blob> {
    const encodePayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post(`${this.apiUrl}/excel`, encodePayload, {withCredentials: true, responseType: 'blob'});
  }

  GetFileSaleStock(requestPayload: any): Observable<any[]> {
    const encrypPayload = this.encrypt.encrypPayload(requestPayload);
    return this.http.post<any[]>(`${this.apiUrl}/filestocksale`, encrypPayload, {withCredentials: true});
  } 
}


export interface StockDetailDto {
  CusId?: string;
  TitleDesc?: string;
  CusFName?: string;
  CusLName?: string;
  StCode?: string;
  StDesc?: string;
  StkNote?: string;
  StkNoStart?: string;
  StkNoStop?: string;
  StkUnit?: number;
  StkValue?: number;
  DvnLST?: number;
  CbsDAT?: number;
  CbsOUT?: number;
  AllowGen?: number;
}
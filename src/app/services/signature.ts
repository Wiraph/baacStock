import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../environments/environments';

// ข้อมูลผู้ลงนาม
export interface Signature {
  empId: number;
  empName: string;
  empPosition: string;
  substituteTo: string | null;
  sigFileData: string;
}

// ข้อมูลหุ้น
export interface StockData {
  stkNOTE: string;          
  stkOWNiD: string;         
  stkUNiT: number;         
  stkValue: number;         
  stkDateIssue: string;     
  stkDateEffect: string;    
  stkDateApprove: string;  
  stkDatePrint: string;      
  stkNOStart: string;       
  stkNOStop: string;       
  stkPayType: string;       
  stkSTATUS: string;    
  cusiD: string;            
  cusFName: string;     
  cusLName: string;         
  titleCode: string;        
  cusCODE: string;          
  cusCODEg: string;      
  titleDESC: string;        
  titleABBR: string;        
  brCode: string;           
  brName: string;           
  fullName?: string;         
  statusDesc?: string;      
}

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Signature/signature`;

  constructor(private readonly http: HttpClient) { }

  getSignatures(): Observable<Signature[]> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('ไม่มีการยืนยันตัวตน กรุณา login ใหม่'));
    }

    return this.http.get<Signature[]>(this.apiUrl, {
      headers: this.createAuthHeaders()
    }).pipe(
      timeout(10000), // เพิ่ม timeout 10 วินาที
      map((signatures: Signature[]) => {
        console.log('Raw signatures from API:', signatures);
        
        return signatures || [];
      }),
      catchError(this.handleError)
    );
  }

  // ทดสอบ API endpoint และ payload หลายแบบ
  testMultipleAPIs(searchPayload: any): Observable<StockData[]> {
    const token = sessionStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('ไม่มีการยืนยันตัวตน กรุณา login ใหม่'));
    }

    // ลองหลาย API endpoint
    const stockApiUrls = [
      `${environment.dotnetApiUrl}/api/Stock/stkdetail`,
      `${environment.dotnetApiUrl}/api/Stock/search`,
      `${environment.dotnetApiUrl}/api/Stock/getStockData`,
      `${environment.dotnetApiUrl}/api/Stock/getStocks`,
      `${environment.dotnetApiUrl}/api/Stock/getStockByNote`
    ];
    
    // ลองหลาย payload format
    const payloadVariations = [
      { stkNOTE: searchPayload.stkNOTE }, // ลองส่งแค่ stkNOTE เดียว
      { stockNumber: searchPayload.stkNOTE }, // ลองส่งแค่ stockNumber เดียว
      { note: searchPayload.stkNOTE }, // ลองส่งแค่ note เดียว
      { action: 'SEARCH', stkNOTE: searchPayload.stkNOTE },
      { action: 'GET', stkNOTE: searchPayload.stkNOTE },
      { action: 'FIND', stkNOTE: searchPayload.stkNOTE },
      searchPayload // payload ต้นฉบับ
    ];
    
    console.log('Testing multiple API endpoints and payloads...');
    
    // ใช้ endpoint แรกและ payload แรกก่อน
    const stockApiUrl = stockApiUrls[0];
    const payload = payloadVariations[0];
    
    console.log('Using API URL:', stockApiUrl);
    console.log('Using Payload:', JSON.stringify(payload, null, 2));
    
    return this.http.post<any[]>(stockApiUrl, payload, {
      headers: this.createAuthHeaders()
    }).pipe(
      timeout(15000),
      map((response: any) => {
        console.log('Stock API Response:', response);
        console.log('Response type:', typeof response);
        
        // ถ้า response เป็น array ให้ใช้เลย
        if (Array.isArray(response)) {
          return response.map((item: any) => this.mapStockData(item));
        }
        
        // ถ้า response เป็น object และมี data property
        if (response && typeof response === 'object' && response.data) {
          console.log('Response has data property:', response.data);
          if (Array.isArray(response.data)) {
            return response.data.map((item: any) => this.mapStockData(item));
          }
        }
        
        // ถ้า response เป็น string (อาจเป็น error message)
        if (typeof response === 'string') {
          console.log('Response is string:', response);
          return [];
        }
        
        console.log('No valid data found in response');
        return [];
      }),
      catchError(this.handleError)
    );
  }

  // ทดสอบ API endpoint ต่างๆ
  testStockAPI(searchPayload: any): Observable<StockData[]> {
    return this.testMultipleAPIs(searchPayload);
  }

  // ดึงข้อมูลหุ้น
  getStockData(searchPayload: any): Observable<StockData[]> {
    return this.testStockAPI(searchPayload);
  }

  // แปลงข้อมูล API เป็น StockData
  private mapStockData(apiData: any): StockData {
    return {
      // tbl_Stock
      stkNOTE: apiData.stkNOTE || '',
      stkOWNiD: apiData.stkOWNiD || '',
      stkUNiT: apiData.stkUNiT || 0,
      stkValue: apiData.stkValue || 0,
      stkDateIssue: apiData.stkDateIssue || '',
      stkDateEffect: apiData.stkDateEffect || '',
      stkDateApprove: apiData.stkDateApprove || '',
      stkDatePrint: apiData.stkDatePrint || '',
      stkNOStart: apiData.stkNOStart || '',
      stkNOStop: apiData.stkNOStop || '',
      stkPayType: apiData.stkPayType || '',
      stkSTATUS: apiData.stkSTATUS || '',
      
      // tbl_cusTOMER
      cusiD: apiData.cusiD || '',
      cusFName: apiData.cusFName || '',
      cusLName: apiData.cusLName || '',
      titleCode: apiData.titleCode || '',
      cusCODE: apiData.cusCODE || '',
      cusCODEg: apiData.cusCODEg || '',
      
      // tbl_TiTLE
      titleDESC: apiData.titleDESC || '',
      titleABBR: apiData.titleABBR || '',
      
      // tbl_BRN
      brCode: apiData.brCode || '',
      brName: apiData.brName || '',
      
      // คำนวณเพิ่มเติม
      fullName: this.buildFullName(apiData.titleABBR, apiData.cusFName, apiData.cusLName),
      statusDesc: this.getStatusDescription(apiData.stkSTATUS)
    };
  }

  // สร้างชื่อเต็ม
  private buildFullName(title: string, firstName: string, lastName: string): string {
    return `${title || ''} ${firstName || ''} ${lastName || ''}`.trim();
  }

  // แปลงสถานะเป็นคำอธิบาย
  private getStatusDescription(status: string): string {
    const statusMap: { [key: string]: string } = {
      'S000': 'ปกติ',
      'S001': 'รออนุมัติ',
      'S002': 'ยกเลิก',
      'S003': 'หมดอายุ',
      'S004': 'ระงับ',
      'S005': 'โอน',
      'S006': 'ขาย',
      'S007': 'สูญหาย',
      'S008': 'บล็อค'
    };
    return statusMap[status] || status;
  }

  private createAuthHeaders(): HttpHeaders {
    const token = sessionStorage.getItem('token') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private handleError(error: HttpErrorResponse) {
    console.error('SignatureService Error:', error);
    return throwError(() => new Error('เกิดข้อผิดพลาดในการเชื่อมต่อ'));
  }
}

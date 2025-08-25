import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, map } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { timeout } from 'rxjs/operators'; // Added missing import

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
  // tbl_Stock
  stkNOTE: string;           // เลขที่ใบหุ้น
  stkOWNiD: string;          // เลขบัตรประชาชนผู้ถือหุ้น
  stkUNiT: number;           // จำนวนหุ้น
  stkValue: number;          // มูลค่าหุ้น
  stkDateIssue: string;      // วันที่ออกใบหุ้น
  stkDateEffect: string;     // วันที่มีผล
  stkDateApprove: string;    // วันที่อนุมัติ
  stkDatePrint: string;      // วันที่พิมพ์
  stkNOStart: string;        // เลขหุ้นเริ่มต้น
  stkNOStop: string;         // เลขหุ้นสิ้นสุด
  stkPayType: string;        // ประเภทการจ่ายเงินปันผล
  stkSTATUS: string;         // สถานะหุ้น
  
  // tbl_cusTOMER
  cusiD: string;             // เลขบัตรประชาชน
  cusFName: string;          // ชื่อ
  cusLName: string;          // นามสกุล
  titleCode: string;         // รหัสคำนำหน้า
  cusCODE: string;           // รหัสประเภทลูกค้า
  cusCODEg: string;          // รหัสกลุ่มลูกค้า
  
  // tbl_TiTLE
  titleDESC: string;         // คำอธิบายคำนำหน้า
  titleABBR: string;         // คำย่อ
  
  // tbl_BRN
  brCode: string;            // รหัสสาขา
  brName: string;            // ชื่อสาขา
  
  // คำนวณเพิ่มเติม
  fullName?: string;         // ชื่อเต็ม (title + name + surname)
  statusDesc?: string;       // คำอธิบายสถานะ
}

@Injectable({
  providedIn: 'root'
})
export class SignatureService {
  private readonly apiUrl = 'https://localhost:7089/api/Signature/signature';

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
        
        // ลบการกรองออกเพื่อให้ได้ข้อมูลครบ
        // return signatures.filter(sig => !sig.substituteTo);
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
      'https://localhost:7089/api/Stock/stkdetail',
      'https://localhost:7089/api/Stock/search',
      'https://localhost:7089/api/Stock/getStockData',
      'https://localhost:7089/api/Stock/getStocks',
      'https://localhost:7089/api/Stock/getStockByNote'
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
    let errorMessage = 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `ข้อผิดพลาด: ${error.error.message}`;
    } else {
      // Log response body สำหรับ debug
      console.error('Error Response Body:', error.error);
      console.error('Error Status:', error.status);
      console.error('Error Headers:', error.headers);
      console.error('Error Message:', error.message);
      console.error('Error Name:', error.name);
      
      switch (error.status) {
        case 400:
          // แสดงรายละเอียดจาก response body ถ้ามี
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              errorMessage = `ข้อมูลไม่ถูกต้อง: ${error.error.message}`;
            } else if (error.error.error) {
              errorMessage = `ข้อมูลไม่ถูกต้อง: ${error.error.error}`;
            } else {
              errorMessage = `ข้อมูลไม่ถูกต้อง (400): ${JSON.stringify(error.error)}`;
            }
          } else if (error.error && typeof error.error === 'string') {
            errorMessage = `ข้อมูลไม่ถูกต้อง: ${error.error}`;
          } else {
            // กรณีที่ response เป็น text (ไม่ใช่ JSON)
            try {
              // ลองดึง error message จากหลายแหล่ง
              let textResponse = '';
              if (error.error) {
                textResponse = error.error.toString();
              } else if (error.message) {
                textResponse = error.message;
              } else if (error.statusText) {
                textResponse = error.statusText;
              } else {
                textResponse = 'Unknown error';
              }
              
              // ลบส่วน "Unexpected token" ออกถ้ามี
              if (textResponse.includes('Unexpected token')) {
                const match = textResponse.match(/"([^"]+)"/);
                if (match) {
                  textResponse = match[1];
                } else {
                  // ถ้าไม่มี quotes ให้ดึงข้อความหลังจาก "Unexpected token"
                  const parts = textResponse.split('Unexpected token');
                  if (parts.length > 1) {
                    textResponse = parts[1].trim();
                  }
                }
              }
              
              errorMessage = `ข้อมูลไม่ถูกต้อง: ${textResponse}`;
            } catch (e) {
              errorMessage = 'ข้อมูลไม่ถูกต้อง - กรุณาตรวจสอบข้อมูลที่ส่งไป';
            }
          }
          break;
        case 401:
          errorMessage = 'Token หมดอายุหรือไม่ถูกต้อง - กรุณา login ใหม่';
          sessionStorage.removeItem('token');
          break;
        case 403:
          errorMessage = 'ไม่มีสิทธิ์เข้าถึงข้อมูลนี้';
          break;
        case 404:
          errorMessage = 'ไม่พบ API endpoint - กรุณาตรวจสอบ URL';
          break;
        case 500:
          errorMessage = 'ข้อผิดพลาดที่ server - กรุณาติดต่อผู้ดูแลระบบ';
          break;
        case 0:
          errorMessage = 'ไม่สามารถเชื่อมต่อกับ server ได้ - กรุณาตรวจสอบการเชื่อมต่อ';
          break;
        default:
          // ตรวจสอบ timeout error
          if (error.message && error.message.includes('timeout')) {
            errorMessage = 'การเชื่อมต่อใช้เวลานานเกินไป - กรุณาลองใหม่อีกครั้ง';
          } else {
            errorMessage = `ข้อผิดพลาด HTTP: ${error.status} - ${error.message}`;
          }
      }
    }
    
    console.error('SignatureService Error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

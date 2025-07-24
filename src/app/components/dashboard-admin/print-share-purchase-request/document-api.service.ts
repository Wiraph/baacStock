import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * ผลลัพธ์การอัปโหลดเอกสาร
 * - template_id: รหัสเอกสาร ที่สร้างขึ้น
 * - keys: รายการ key ที่พบในเอกสาร
 * - validation: ผลการตรวจสอบความถูกต้องของ key
 * - statistics: สถิติต่างๆ ของ key
 */
export interface UploadTemplateResponse {
  template_id: string;
  keys: string[];
  validation?: any;
  statistics?: any;
}

/**
 * คำขอสร้างเอกสาร
 * - template_id: รหัสเอกสาร ที่จะใช้
 * - data: ข้อมูลที่จะกรอกลงในเอกสาร (key-value pairs)
 */
export interface GenerateDocRequest {
  template_id: string;
  data: { [key: string]: string };
}

/**
 * ผลลัพธ์การสร้างเอกสาร
 * - docx_url: URL สำหรับดาวน์โหลดไฟล์ DOCX
 * - pdf_url: URL สำหรับดาวน์โหลดไฟล์ PDF 
 */
export interface GenerateDocResponse {
  docx_url: string;
  pdf_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentApiService {
  // URL ของ backend API
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private http: HttpClient) {}

  /**
   * อัปโหลดเอกสาร และรับ key ที่ตรวจพบ
   * 
   * ขั้นตอนการทำงาน:
   * 1. สร้าง FormData และเพิ่มไฟล์
   * 2. ส่ง POST request ไปยัง /upload-template
   * 3. รับ template_id และ key ที่พบ
   * 
   * @param file - ไฟล์ template (.docx) ที่จะอัปโหลด
   * @returns Observable ที่จะส่งคืนข้อมูล template และ key
   * 
   * ตัวอย่างการใช้งาน:
   * this.documentApi.uploadTemplate(file).subscribe(response => {
   *   console.log('Template ID:', response.template_id);
   *   console.log('Key found:', response.key);
   * });
   */
  uploadTemplate(file: File): Observable<UploadTemplateResponse> {
    // สร้าง FormData สำหรับส่งไฟล์
    const formData = new FormData();
    formData.append('file', file);

    // ส่ง POST request ไปยัง backend
    return this.http.post<UploadTemplateResponse>(
      `${this.baseUrl}/upload-template`,
      formData
    );
  }

  /**
   * สร้างเอกสารจาก template และข้อมูลที่กรอก
   * 
   * ขั้นตอนการทำงาน:
   * 1. สร้าง FormData และเพิ่ม template_id และข้อมูล
   * 2. ส่ง POST request ไปยัง /generate-doc
   * 3. รับ URL สำหรับดาวน์โหลดไฟล์ DOCX และ PDF
   * 
   * @param templateId - รหัส template ที่จะใช้สร้างเอกสาร
   * @param data - ข้อมูลที่จะกรอกลงในเอกสาร (key-value pairs)
   * @returns Observable ที่จะส่งคืน URL สำหรับดาวน์โหลดไฟล์
   * 
   * ตัวอย่างการใช้งาน:
   * const data = { name: 'John Doe', address: '123 Main St' };
   * this.documentApi.generateDocument('template_123', data).subscribe(response => {
   *   console.log('DOCX URL:', response.docx_url);
   *   console.log('PDF URL:', response.pdf_url);
   * });
   */
  generateDocument(templateId: string, data: { [key: string]: string }): Observable<GenerateDocResponse> {
    // สร้าง FormData สำหรับส่งข้อมูล
    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('data', JSON.stringify(data)); // แปลงข้อมูลเป็น JSON string

    // ส่ง POST request ไปยัง backend
    return this.http.post<GenerateDocResponse>(
      `${this.baseUrl}/generate-doc`,
      formData
    );
  }

  /**
   * ดาวน์โหลดไฟล์จาก URL
   * 
   * ขั้นตอนการทำงาน:
   * 1. สร้าง URL เต็ม (เพิ่ม baseUrl ถ้าจำเป็น)
   * 2. สร้าง <a> element และตั้งค่า href และ download
   * 3. เพิ่ม element ลงใน DOM และคลิกเพื่อดาวน์โหลด
   * 4. ลบ element ออกจาก DOM
   * 
   * @param url - URL ของไฟล์ที่จะดาวน์โหลด (relative หรือ absolute)
   * @param filename - ชื่อไฟล์ที่จะบันทึก
   * 
   * ตัวอย่างการใช้งาน:
   * this.documentApi.downloadFile('/files/document.docx', 'my_document.docx');
   */
  downloadFile(url: string, filename: string): void {
    // สร้าง URL เต็ม (เพิ่ม baseUrl ถ้าเป็น relative URL)
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    // สร้าง <a> element สำหรับดาวน์โหลด
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename; // ตั้งชื่อไฟล์ที่จะบันทึก
    
    // เพิ่ม element ลงใน DOM และคลิกเพื่อดาวน์โหลด
    document.body.appendChild(link);
    link.click();
    
    // ลบ element ออกจาก DOM
    document.body.removeChild(link);
  }

  /**
   * ดึง URL เต็มสำหรับไฟล์ DOCX
   * 
   * @param response - ผลลัพธ์จาก generateDocument
   * @returns URL เต็มสำหรับดาวน์โหลดไฟล์ DOCX
   * 
   * ตัวอย่างการใช้งาน:
   * const docxUrl = this.documentApi.getDocxUrl(response);
   * console.log('DOCX URL:', docxUrl);
   */
  getDocxUrl(response: GenerateDocResponse): string {
    return `${this.baseUrl}${response.docx_url}`;
  }

  /**
   * ดึง URL เต็มสำหรับไฟล์ PDF (ถ้ามี)
   * 
   * @param response - ผลลัพธ์จาก generateDocument
   * @returns URL เต็มสำหรับดาวน์โหลดไฟล์ PDF หรือ null ถ้าไม่มี
   * 
   * ตัวอย่างการใช้งาน:
   * const pdfUrl = this.documentApi.getPdfUrl(response);
   * if (pdfUrl) {
   *   console.log('PDF URL:', pdfUrl);
   *   this.downloadFile(pdfUrl, 'document.pdf');
   * }
   */
  getPdfUrl(response: GenerateDocResponse): string | null {
    return response.pdf_url ? `${this.baseUrl}${response.pdf_url}` : null;
  }
} 
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// ผลลัพธ์การอัปโหลดเอกสาร
export interface UploadTemplateResponse {
  template_id: string;
  keys: string[];
  validation?: any;
  statistics?: any;
}

// คำขอสร้างเอกสาร
export interface GenerateDocRequest {
  template_id: string;
  data: { [key: string]: string };
}

// ผลลัพธ์การสร้างเอกสาร
export interface GenerateDocResponse {
  docx_url: string;
  pdf_url: string;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentApiService {
  private readonly baseUrl = 'http://localhost:8000';

  constructor(private readonly http: HttpClient) {}

  // อัปโหลดเอกสาร template และรับ key ที่พบ
  uploadTemplate(file: File): Observable<UploadTemplateResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<UploadTemplateResponse>(
      `${this.baseUrl}/upload-template`,
      formData
    );
  }

  // สร้างเอกสารจาก template และข้อมูล
  generateDocument(templateId: string, data: { [key: string]: string }): Observable<GenerateDocResponse> {
    const formData = new FormData();
    formData.append('template_id', templateId);
    formData.append('data', JSON.stringify(data));

    return this.http.post<GenerateDocResponse>(
      `${this.baseUrl}/generate-doc`,
      formData
    );
  }

  // ดาวน์โหลดไฟล์จาก URL
  downloadFile(url: string, filename: string): void {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    
    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // ดึง URL เต็มสำหรับไฟล์ DOCX
  getDocxUrl(response: GenerateDocResponse): string {
    return `${this.baseUrl}${response.docx_url}`;
  }

  // ดึง URL เต็มสำหรับไฟล์ PDF
  getPdfUrl(response: GenerateDocResponse): string | null {
    return response.pdf_url ? `${this.baseUrl}${response.pdf_url}` : null;
  }
} 
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Spin {
  private apiUrl = 'https://localhost:7089/api/Spin';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  createSpinFile(): Observable<any> {
    // Implementation for creating a spin file
    return this.http.post<any>(`${this.apiUrl}/create-dat-file`, {}, {
      headers: this.createAuthHeaders()
    });
  }

  getSpinFiles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list`, {
      headers: this.createAuthHeaders()
    });
  }

  getSpinFilesOut(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/list-out`, {
      headers: this.createAuthHeaders()
    });
  }

  downloadSpinFile(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download?fileName=${fileName}`, {
      responseType: 'blob',
      headers: this.createAuthHeaders()
    });
  }

  downloadSpinFileOut(fileName: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download-out?fileName=${fileName}`, {
      responseType: 'blob',
      headers: this.createAuthHeaders()
    });
  }

  uploadFiles(files: File[]): Observable<any> {
    const formData = new FormData();
    for (const file of files) {
      formData.append('files', file); // ชื่อ 'files' ต้องตรงกับ .NET `[FromForm] IFormFileCollection files`
    }

    return this.http.post(`${this.apiUrl}/upload`, formData, {
      headers: this.createAuthHeaders()
    });
  }


  private createAuthHeaders() {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}

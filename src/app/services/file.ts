import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpEvent, HttpHeaders, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private apiUrl = 'https://localhost:7089/api/File';
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  uploadFile(file: File): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = this.createAuthHeaders();

    return this.http.request('POST', `${this.apiUrl}/upload`, {
      body: formData,
      reportProgress: true,
      observe: 'events',
      headers: headers
    });
  }

  getFiles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, {
      headers: this.createAuthHeaders()
    });
  }

  downloadFile(fileName: string): Observable<Blob> {
    const encodedFileName = encodeURIComponent(fileName);
    const url = `${this.apiUrl}/download/${encodedFileName}`;

    return this.http.get(url, {
      responseType: 'blob'  // สำคัญ ต้องเป็น blob เพราะเป็น binary file
    });
  }


  delete(fileName: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${encodeURIComponent(fileName)}`, {
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

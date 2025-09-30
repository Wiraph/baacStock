import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { EncryptionService } from './encryption.service';

@Injectable({
  providedIn: 'root'
})
export class ManualService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Manual`;
  constructor(
    private readonly http: HttpClient,
    private readonly encryptionService: EncryptionService
  ) { }

  // Get File List
  getFileList(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/list`, { withCredentials: true });
  }

  downloadFile(fileName: string): Observable<Blob> {
    const payload = {
      filePath: fileName
    };

    const encryptionPayload = this.encryptionService.encrypPayload(payload);
    return this.http.post(`${this.apiUrl}/download`, encryptionPayload, {
      responseType: 'blob',
      withCredentials: true
    });
  }
}

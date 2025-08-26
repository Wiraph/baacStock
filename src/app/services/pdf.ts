import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) { }

  getShareRequestPdf(payload: any) {
    const params = new HttpParams()
      .set('docNumber', payload.docNumber)
      .set('brName', payload.brName)
      .set('printedBy', payload.printedBy);

    return this.http.post(`${environment.dotnetApiUrl}/api/pdf/generate`, payload, {
      responseType: 'blob',
      headers: this.createAuthHeaders()
    });
  }


  private createAuthHeaders(): HttpHeaders {
    let token = '';
    if (isPlatformBrowser(this.platformId)) {
      token = sessionStorage.getItem('token') || '';
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}

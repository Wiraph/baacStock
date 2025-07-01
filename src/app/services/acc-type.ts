import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface AccType {
  accType: string;
  accDesc: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccTypeService {
  private apiUrl = 'https://localhost:7089/api/Acctype';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  getAllAccTypes(): Observable<AccType[]> {
    return this.http.get<AccType[]>(this.apiUrl, {
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

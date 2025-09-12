import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StockMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/StockMetadata`;
  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly plateformId: Object
  ) { }

  stkTyps(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stktypes`, {
      withCredentials: true
    });
  }

  accTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/acctypes`, {
      withCredentials: true
    });
  }
}

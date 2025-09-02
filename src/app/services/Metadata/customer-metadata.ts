import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerMetadata {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/CustomerMetadata`;
  constructor(
    private readonly http: HttpClient,
  ) { }

  cusTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/custypes`, {
      withCredentials: true
    });
  }

  docTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctypes`, {
      withCredentials: true
    });
  }

  titles(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/titles`, {
      withCredentials: true
    });
  }
}

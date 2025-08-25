import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


export interface Remcode {
  remCode: string;
  remDesc: string;
}

@Injectable({
  providedIn: 'root'
})
export class RemCodeService {
  private apiUrl = 'https://localhost:7089/api/remcode';

  constructor(private http: HttpClient) { }

  getRemCodes() {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<any[]>(this.apiUrl, { headers });
  }
}

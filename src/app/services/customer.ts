import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface CustomerSearchDto {
  cusId?: string;
  stockId?: string;
  fname?: string;
  lname?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private apiUrl = 'https://localhost:7089/api/customer';

  constructor(private http: HttpClient) { }

  searchCustomer(criteria: CustomerSearchDto): Observable<any[]> {
    const token = sessionStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.post<any[]>(`${this.apiUrl}/search`, criteria, { headers });
  }
}

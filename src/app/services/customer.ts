import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

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

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  getAllCustype(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/custype`, { headers: this.createAuthHeaders() });
  }

  getCustomerById(cusId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/edit`, { params: {cusId }, headers: this.createAuthHeaders() });
  }

  getAllDoctype(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/doctype`, { headers: this.createAuthHeaders() });
  }

  getAllTitle(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/title`, { headers: this.createAuthHeaders() });
  }

  getAllProvince(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/province`, { headers: this.createAuthHeaders() });
  }

  getAumphor(prvCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/aumphor/${prvCode}`, { headers: this.createAuthHeaders() });
  }

  getTumbons(prvCode: string, ampCode: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tumbons/${prvCode}/${ampCode}`, { headers: this.createAuthHeaders() });
  }

  updateCustomer(data: {
    customer: any;
    homeAddress: any;
    currentAddress: any;
  }): Observable<any> {
    const headers = this.createAuthHeaders();
    return this.http.put(`${this.apiUrl}/update`, data, { headers });
  }

  getAllAcctypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/acctyps`, { headers: this.createAuthHeaders() });
  }

  searchCustomer(criteria: any, page: number, pageSize: number) {
    return this.http.post<any>(
      `${this.apiUrl}/search?pageNumber=${page}&pageSize=${pageSize}`,
      criteria , { headers: this.createAuthHeaders() }
    );
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

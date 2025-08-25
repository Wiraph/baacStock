import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EncryptionService } from './encryption.service';
import { environment } from '../../environments/environments';

export interface AddressDto {
  cusiD: string,
  addCode: string,
  housEno: string,
  troG_SOI: string,
  road: string,
  prvCODE: string,
  ampCODE: string,
  tmbCODE: string,
  mooCODE: string,
  zipcode: string,
  phone: string,
  addR1: string,
  addR2: string,
  datetimeup: string,
  userid: string,
  ipaddress: string,
  hostname: string
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/Address`;

  constructor(
    private readonly http: HttpClient,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly encryped: EncryptionService
  ) { }

  getDefaultAddress(): AddressDto {
    return {
      cusiD: "",
      addCode: "",
      housEno: "",
      troG_SOI: "",
      road: "",
      prvCODE: "",
      ampCODE: "",
      tmbCODE: "",
      mooCODE: "",
      zipcode: "",
      phone: "",
      addR1: "",
      addR2: "",
      datetimeup: "",
      userid: "",
      ipaddress: "",
      hostname: ""
    }
  }

  getAddress(requestPayload: any) {
    const encrypPayload = this.encryped.encrypPayload(requestPayload);
    return this.http.post<{ homeAddress: any, currentAddress: any }>(
      `${this.apiUrl}/address`,
      encrypPayload,
      { headers: this.createAuthHeaders() }
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
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Login {
  private readonly apiUrl = `${environment.dotnetApiUrl}/api/auth/login`;
  constructor(
    private readonly http: HttpClient
  ) { }

  login(username: string, password: string):Observable<any[]>{
    const payload = {
      username: username,
      password: password
    }
    return this.http.post<any[]>(`${this.apiUrl}`, payload);
  }
}

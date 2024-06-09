import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerAuthService {
  
  private serverUrl = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient) {}

  getPasswordByUserName(username: string): Observable<string>{
    const url = `${this.serverUrl}/users/password`;
    return this.http.get<string>(url, { params: { username } });
  }

  changePassword(username: string, newPas: string): Observable<string> {
    const url = `${this.serverUrl}/users/${username}/password`;
    return this.http.put<any>(url, { newPassword: newPas });
  }


}

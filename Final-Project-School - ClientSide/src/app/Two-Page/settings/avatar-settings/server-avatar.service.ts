import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ServerAvatarService {

  
  private serverUrl = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient) {}

  updateAvatarImage(formData: FormData, username: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/avatar`; // Assuming server API endpoint is /users/:username/avatar
    return this.http.put<any>(url, formData);
  }

}

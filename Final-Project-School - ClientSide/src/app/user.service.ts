import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private usernameSubject = new BehaviorSubject<string>(''); 
  username$ = this.usernameSubject.asObservable();

  setUsername(username: string): void {
    this.usernameSubject.next(username);
  }

  getUsername(): string {
    return this.usernameSubject.value;
  }
}

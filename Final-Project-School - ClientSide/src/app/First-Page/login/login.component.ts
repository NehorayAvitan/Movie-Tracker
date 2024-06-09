import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EncryptionService } from '../../encryption.service';
import { ServerService } from '../../server.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  @Output() loginSuccess: EventEmitter<void> = new EventEmitter<void>();
  private serverUrl = 'http://127.0.0.1:3000';

  constructor(private fb: FormBuilder, 
    private serverService: ServerService  ) {}
    

  ngOnInit() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get username() {
    return this.loginForm.get('username');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    

    this.serverService.login(username, password).subscribe(
        (response: any) => {
          console.log(response)
          if (response.message === "User is not exist") {
            window.alert(response.message);
          } else {
            this.loginSuccess.emit(username);  
          }
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }
}

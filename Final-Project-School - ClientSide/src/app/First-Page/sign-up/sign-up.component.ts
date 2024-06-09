import { HttpClient } from '@angular/common/http';
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { EncryptionService } from '../../encryption.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css']
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  @Output() signUpSuccess: EventEmitter<void> = new EventEmitter<void>();
  private serverUrl = 'http://127.0.0.1:3000';

  constructor(
    private fb: FormBuilder, 
    private http: HttpClient,
    private encryptionService: EncryptionService,
  ) {}

  ngOnInit() {
    this.signUpForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      email: ['', [Validators.required, Validators.email, this.gmailValidator]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordComplexityValidator]],
      confirmPassword: ['', Validators.required],
      agreeTerms: [false, Validators.requiredTrue]
    }, {
      validator: this.passwordMatchValidator
    });
  }
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password').value;
    const confirmPassword = form.get('confirmPassword').value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  gmailValidator(control: AbstractControl): ValidationErrors | null {
    const email = control.value;
    return email && email.endsWith('@gmail.com') ? null : { domain: true };
  }

  passwordComplexityValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) return null;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasMinLength = password.length >= 6;
    const passwordValid = hasUpperCase && hasNumber && hasMinLength;
    return passwordValid ? null : { complexity: true };
  }

  get username() {
    return this.signUpForm.get('username');
  }

  get email() {
    return this.signUpForm.get('email');
  }

  get password() {
    return this.signUpForm.get('password');
  }

  get confirmPassword() {
    return this.signUpForm.get('confirmPassword');
  }

  get agreeTerms() {
    return this.signUpForm.get('agreeTerms');
  }

  onSubmit() {
    if (this.signUpForm.invalid) {
      return;
    }

    const { username, password, email } = this.signUpForm.value;
    
    const encryptedData = this.encryptionService.encrypt({ username, password, email });
    
    this.http.post(`${this.serverUrl}/Sign-Up`, { data: encryptedData })
      .subscribe(
        (response: any) => {
          if (response.message === "Signup successful") {
            this.signUpSuccess.emit(username);
          } else {
            window.alert(response.message);
          }
        },
        (error) => {
          console.error('Error:', error);
        }
      );
  }
}

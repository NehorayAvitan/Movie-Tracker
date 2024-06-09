import { Component, ViewChild, ElementRef } from '@angular/core';
import {ServerAuthService} from './server-auth.service'
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-auth-settings',
  templateUrl: './auth-settings.component.html',
  styleUrl: './auth-settings.component.css'
})
export class AuthSettingsComponent {

  @ViewChild('notificationElement') notificationElement: ElementRef | undefined;

  
  notificationMessage: string = '';
  success: boolean = false;
  error: boolean = false;
  username: string;

  currentPassword: string = '';

  constructor(private ServerAuthService: ServerAuthService, private userService: UserService) { }


  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.getPasswordByUsername(this.username);

  }


  getPasswordByUsername(username: string) {
    this.ServerAuthService.getPasswordByUserName(username)
      .subscribe(
        (data: any) => {
          this.currentPassword = data.password;
        },
        (error) => {
          console.error(error);
        }
      );
  }



  changePassword()
  {
    console.log(this.currentPassword);
    if (this.currentPassword === document.getElementById('currentPassword')['value'])
      {
        const newPas = document.getElementById('new-password')['value'];
        if (newPas && document.getElementById('confirm-new-password')['value'])
          {
            if (newPas === document.getElementById('confirm-new-password')['value'])
              {
                this.ServerAuthService.changePassword(this.username, newPas)
              .subscribe(
                  (response) => {
                    this.showNotification('Password changed successfully!', true);
                  },
                  (error) => {
                   console.error(error);
                   this.showNotification('Failed to change the password', false);
                  }
                );
    
              }
              else
              {
                this.showNotification('The passwords do not equal', false);
              }
          }
          else
          {
            this.showNotification('Failed, you need to enter password', false);
          }
        
      }
      else
      {
        this.showNotification('Incorrent current password', false);
      }
  }

  private showNotification(message: string, success: boolean) {
    this.notificationMessage = message;
    this.success = success;
    this.error = !success;
    setTimeout(() => {
      this.notificationMessage = '';
    }, 3000);
    setTimeout(() => {
      if (this.notificationElement) {
        this.notificationElement.nativeElement.classList.add('show');
      }
    }, 100);
    setTimeout(() => {
      if (this.notificationElement) {
        this.notificationElement.nativeElement.classList.remove('show');
      }
    }, 3000);
  }


}

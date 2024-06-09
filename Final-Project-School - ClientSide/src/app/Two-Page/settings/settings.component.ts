import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../user.service';
import { TmdbService } from '../../tmdb.service';
import { ServerService } from '../../server.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})

export class SettingsComponent implements OnInit {
  @ViewChild('notificationElement') notificationElement: ElementRef | undefined;
  
  user: any = {};
  username: string;
  notificationMessage: string = '';
  success: boolean = false;
  error: boolean = false;
  settingsForm: FormGroup;
  

  constructor(
    private fb: FormBuilder,
    private serverService: ServerService,
    private tmdbService: TmdbService,
    private userService: UserService,
    private router: Router, private route: ActivatedRoute) { }

  ngOnInit() {
    this.settingsForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.pattern(/^[a-zA-Z0-9_]+$/)]],
      familyName: ['', Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      location: ['', Validators.pattern(/^[a-zA-Z0-9_]+$/)],
      website: ['', Validators.pattern(/^[a-zA-Z0-9_ .,!?]+$/)],
      bio: ['', Validators.pattern(/^[a-zA-Z0-9_ .,!?]+$/)]
    });

    this.username = this.userService.getUsername();
    this.getUserByUsername(this.username);
  }

  getUserByUsername(username: string) {
    this.serverService.getUserByUsername(username)
      .subscribe(
        (data) => {
          this.user = data;
          console.log(this.user);
          this.settingsForm.patchValue(this.user);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  saveChanges() {
    if (this.settingsForm.invalid) {
      return;
    }

    const updatedUser = {
      ...this.user,
      ...this.settingsForm.value
    };

    // Call service function to save changes
    this.serverService.updateUser(updatedUser)
      .subscribe(
        (response) => {
          this.showNotification('Changes saved successfully!', true);
        },
        (error) => {
          console.error(error);
          this.showNotification('Failed to save changes', false);
        }
      );
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



  

  isMainProfileView(): boolean {
    return this.route.snapshot.children.length === 0;
  }
}

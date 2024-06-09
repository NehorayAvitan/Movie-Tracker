import { Component } from '@angular/core';
import { ServerAvatarService } from './server-avatar.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-avatar-settings',
  templateUrl: './avatar-settings.component.html',
  styleUrls: ['./avatar-settings.component.css']
})
export class AvatarSettingsComponent {
  url: string;
  selectedFile: File;
  username: string;

  constructor(private serverAvatarService: ServerAvatarService, private userService: UserService) {}

  ngOnInit(): void {
    this.username = this.userService.getUsername();
  }

  onSelectFile(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(this.selectedFile);
      reader.onload = () => {
        this.url = reader.result as string;
      };
    }
  }

  uploadAvatar() {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }
  
    const formData = new FormData();
    formData.append('avatar', this.selectedFile);
  
  
    this.serverAvatarService.updateAvatarImage(formData, this.username)
      .subscribe(
        (response) => {
          console.log('Avatar upload successful:', response);
        },
        (error) => {
          console.error('Error uploading avatar:', error);
        }
      );
  }
  
  
}  
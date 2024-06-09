import { Component, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  loadedOption: string = 'Login'; 

  constructor(private router: Router, private userService: UserService) {}

  onNavigate(option: string, username: string) {
    this.loadedOption = option;

    if (option === 'Home') {
      this.userService.setUsername(username)
      this.router.navigate(['/home']); // Pass username as query parameter
    }
  }
}

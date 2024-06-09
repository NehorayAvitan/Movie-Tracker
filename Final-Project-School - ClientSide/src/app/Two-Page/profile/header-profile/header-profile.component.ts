import { Component } from '@angular/core';
import { UserService } from '../../../user.service';
import { ServerService } from '../../../server.service';

@Component({
  selector: 'app-header-profile',
  templateUrl: './header-profile.component.html',
  styleUrl: './header-profile.component.css'
})
export class HeaderProfileComponent {
  userName: string;
  bio: string = 'hey my name is!';
  user: any = {};
  userStats: any = {};


  constructor(private userService: UserService, 
    private serverService: ServerService) { }


  ngOnInit() {
      this.userName = this.userService.getUsername();
      this.getUserByUsername(this.userName);
      this.getUserStatsByUsername(this.userName);

  }

  getUserByUsername(username: string) {
    this.serverService.getUserByUsername(username)
      .subscribe(
        (data) => {
          this.user = data;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getUserStatsByUsername(username: string)
  {
    this.serverService.getUserStats(username)
      .subscribe(
        (data) => {
          this.userStats = data;
        },
        (error) => {
          console.error(error);
        }
      );
  }

  getProfileName()
  {
    if (this.user.name)
      {
        return this.user.name + " " + this.user.familyName;
      }
    else
    {
      return this.user.username;
    }
  }

}

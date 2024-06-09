import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../user.service';
import { TmdbService } from '../../../tmdb.service';
import { ServerService } from '../../../server.service';

@Component({
  selector: 'app-activity-profile',
  templateUrl: './activity-profile.component.html',
  styleUrl: './activity-profile.component.css'
})
export class ActivityProfileComponent implements OnInit{

  username: string;
  logs: any[] = [];


  constructor(private userService: UserService,
    private serverService: ServerService,
    private tmdbService: TmdbService,
  )
  {}

  ngOnInit() {
    this.username = this.userService.getUsername();
    this.getUserLogs(this.username);

  }

  getUserLogs(username: string) {
    this.serverService.getUserLogs(username)
      .subscribe(
        (data) => {
          this.logs = data;
          this.processLogs();
        },
        (error) => {
          console.error(error);
        }
      );
  }

  processLogs() {
    for (let log of this.logs) {
      const logParts = log.data.match(/(rated|added) (\d+)( (\d+(\.\d+)?))?/);
  
      if (logParts) {
        const action = logParts[1];
        const movieId = logParts[2];
        
        if (action === 'rated') {
          const rating = parseFloat(logParts[4]);
          try {
            this.tmdbService.getMovieDetails(movieId.toString())
            .subscribe((movie: any) => {
              const movieTitle = movie.title;
              const ratingStr = rating ? ` ${this.getStarRating(rating)}` : '';
              log.data = `rated ${movieTitle}${ratingStr}`;
            });
            
          } catch (error) {
            console.error('Error fetching movie title:', error);
          }
        } else if (action === 'added') {
          try {
            this.tmdbService.getMovieDetails(movieId.toString())
            .subscribe((movie: any) => {
              const movieTitle = movie.title;
              log.data = `added ${movieTitle} to your watchlist`;
            });
            
          } catch (error) {
            console.error('Error fetching movie title:', error);
          }
        }
      }
    }
  }
  
  

  getStarRating(rating: number): string {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? '½' : '';
    return '★'.repeat(fullStars) + halfStar;
  }

}
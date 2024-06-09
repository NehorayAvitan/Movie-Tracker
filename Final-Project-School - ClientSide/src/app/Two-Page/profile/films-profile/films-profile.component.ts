import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../user.service';
import { forkJoin, map } from 'rxjs';
import { TmdbService } from '../../../tmdb.service';
import { Router } from '@angular/router';
import { MovieIdService } from '../../movie-id.service';
import { ServerService } from '../../../server.service';

@Component({
  selector: 'app-films-profile',
  templateUrl: './films-profile.component.html',
  styleUrls: ['./films-profile.component.css']
})
export class FilmsProfileComponent implements OnInit {

  username: string;

  watchedMovies: any[] = [];
  watchListMovies: any[] = [];

  selectedMovie: any = null;


  constructor(
    private userService: UserService, 
    private serverService: ServerService,
    private tmdbService: TmdbService
  ) { }

  ngOnInit() {
    this.username = this.userService.getUsername();
    this.getWatchedMovies();
  }

  getWatchListMovies()
  {
    this.serverService.getWatchlistMovies(this.username).subscribe(
      (data: any) => {
        if (data.message === "Watchlist is empty")
          {
            this.watchListMovies = [];
          }
        else if (data && data.watchList && data.watchList.length > 0) {
          this.watchListMovies = data.watchList.map((movieId: string) => ({ movieId }));
        } 
      },
      error => {
        console.error('Error fetching watched movies:', error);
      }
    );
  }



  getWatchedMovies() {
    this.serverService.getWatchedMovies(this.username).subscribe(
      (data: any) => {
        if (data && data.watchedMovies && data.watchedMovies.length > 0) {
          const movieDetailsObservables = data.watchedMovies.map((movie: any) =>
            this.tmdbService.getMovieDetails(movie.movieId).pipe(
              map(movieDetails => ({
                ...movieDetails,
                userRating: movie.rating,
                removed: false
              }))
            )
          );

          forkJoin(movieDetailsObservables).subscribe(
            (movies: any[]) => {
              this.watchedMovies = movies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
              console.log(this.watchedMovies);
            },
            (error) => {
              console.error('Error fetching movie details:', error);
            }
          );
        } else {
          this.watchedMovies = [];
        }
      },
      error => {
        console.error('Error fetching watched movies:', error);
      }
    );
  }

addWatchList(movieId: string)
  {
    this.serverService.addMovieToWatchList(this.username, movieId).subscribe(
      (response: any) => {
        if (response.message === 'Movie is already in the watchlist') {
          console.log('Movie is already in the watch list');
        
          this.serverService.removeWatchListMovieToUser(this.username, movieId).subscribe(
            () => {
              this.getWatchListMovies();
            },
            error => {
              console.log(movieId);
              console.log('Error adding movie:', error);
            }
          );
        } else {
          this.getWatchListMovies();

        }
      },
      error => {
        console.log('Error adding movie:', error);
      }
    );
  }



  addWatched(movieId: string, rating: number) {
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      (response: any) => {
        const movie = this.watchedMovies.find(m => m.id === movieId);
        console.log(response.message);
        if (response.message === 'Movie is already watched') {
          console.log('Movie is already watched');

          this.serverService.removeMovieToUser(this.username, movieId).subscribe(
            () => {
              if (movie) {
                movie.removed = true; 
              }
      
            },
            error => {
              console.log('Error adding movie:', error);
            }
          );   

          
        } else {
          if (movie) {
            movie.removed = false; 
          }          
        }
      },
      error => {
        console.log('Error adding movie:', error);
      }
    );
  }


  isMovieWatched(movieId: number): boolean {
    return this.watchedMovies.some(movie => movie.id === movieId);
  }

  isMovieWatchList(movieId: string): boolean {
    return this.watchListMovies.some(movie => movie.movieId === String(movieId));
  }

  generateStarRating(userRating: number): string {
    if (userRating && userRating > 0 && userRating <= 5) {
      const fullStars = Math.floor(userRating);
      const hasHalfStar = userRating % 1 !== 0;
      let starsHtml = '';
      
      for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="glyphicon glyphicon-star"></span>';
      }
      
      if (hasHalfStar) {
        console.log("A")
        starsHtml += '<span class="half">½</span>';
      }
      
      return starsHtml;
    } else {
      return ''; // Return empty string to hide the stars if rating is invalid
    }
  }

  selectMovie(movie: any) {
    this.selectedMovie = movie;
  }

  closeOptions() {
    this.selectedMovie = null;
  }

  getMovieRating(movieId: string): number {
    const movie = this.watchedMovies.find(m => m.id === movieId);
    return movie ? movie.userRating : 0;
  }

  
  isMovieRemovedFromWatchedList(movieId: string): boolean {
    const movie = this.watchedMovies.find(m => m.id === movieId);
    return movie ? movie.removed : false;
  }

  showAddMovieModal = false;
  currentMovie: any;


  openAddMovieModal(movie: any): void {
    this.showAddMovieModal = true;
    this.currentMovie = movie;
  }

  closeAddMovieModal() {
    this.showAddMovieModal = false;
    this.currentMovie = null;
  }

  
  
  
  
}

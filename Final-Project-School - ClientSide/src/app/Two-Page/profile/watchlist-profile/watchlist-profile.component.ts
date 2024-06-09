import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../user.service';
import { TmdbService } from '../../../tmdb.service';
import { forkJoin, map } from 'rxjs';
import { Router } from '@angular/router';
import { MovieIdService } from '../../movie-id.service';
import { ServerService } from '../../../server.service';

@Component({
  selector: 'app-watchlist-profile',
  templateUrl: './watchlist-profile.component.html',
  styleUrls: ['./watchlist-profile.component.css']
})
export class WatchlistProfileComponent implements OnInit {

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
    this.getWatchListMovies();
  }



  getWatchListMovies() {
    this.serverService.getWatchlistMovies(this.username).subscribe(
      (data: any) => {
        if (data && data.watchList && data.watchList.length > 0) {
          const movieDetailsObservables = data.watchList.map((movie: any) =>
            this.tmdbService.getMovieDetails(movie).pipe(
              map(movieDetails => ({
                ...movieDetails,
                removed: false // Initialize removed property
              }))
            )
          );

          forkJoin(movieDetailsObservables).subscribe(
            (movies: any[]) => {
              this.watchListMovies = movies.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
              console.log(this.watchListMovies);
            },
            (error) => {
              console.error('Error fetching movie details:', error);
            }
          );
        } else {
          this.watchListMovies = [];
        }
      },
      error => {
        console.error('Error fetching watched movies:', error);
      }
    );
  }

  addWatchList(movieId: string) {
    this.serverService.addMovieToWatchList(this.username, movieId).subscribe(
      (response: any) => {
        const movie = this.watchListMovies.find(m => m.id === movieId);
        if (response.message === 'Movie is already in the watchlist') {
          console.log('Movie is already watchlist');
        
          this.serverService.removeWatchListMovieToUser(this.username, movieId).subscribe(
            () => {
              if (movie) {
                movie.removed = true; 
              }
            },
            error => {
              console.log(movieId);
              console.log('Error removing movie:', error);
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

  getWatchedMovies() {
    this.serverService.getWatchedMovies(this.username).subscribe(
      (data: any) => {
        if (data && data.watchedMovies && data.watchedMovies.length > 0) {
          this.watchedMovies = data.watchedMovies.map((movie: any) => ({
            movieId: movie.movieId,
            rating: movie.rating
          }));

          // No need to use forEach to populate movieRatings anymore
          console.log(this.watchedMovies);
        } else {
          this.watchedMovies = [];
        }
      },
      error => {
        console.error('Error fetching watched movies:', error);
      }
    );
  }

  addWatched(movieId: string, rating: number) {
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      (response: any) => {
        console.log(response.message);
        if (response.message === 'Movie is already watched') {
          console.log('Movie is already watched');

          this.serverService.removeMovieToUser(this.username, movieId).subscribe(
            () => {
              this.getWatchedMovies();
      
            },
            error => {
              console.log('Error adding movie:', error);
            }
          );   

          
        } else {
          this.getWatchedMovies();
          
        }
      },
      error => {
        console.log('Error adding movie:', error);
      }
    );
  }

  isMovieWatched(movieId: number): boolean {
    return this.watchedMovies.some(movie => movie.movieId === String(movieId));
  }

  isMovieRemovedFromWatchList(movieId: string): boolean {
    const movie = this.watchListMovies.find(m => m.id === movieId);
    return movie ? movie.removed : false;
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

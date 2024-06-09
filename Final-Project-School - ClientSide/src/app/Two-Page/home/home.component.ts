import { Component, ElementRef, Input, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Router } from '@angular/router';
import { UserService } from '../../user.service';
import { MovieIdService } from '../movie-id.service';
import { ServerService } from '../../server.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  welcomeMessage: string;
  movies: any[] = [];
  username: string; 
  apiKey: string = '0b78940a4556c88d68e43fa555562746';

  watchedMovies: any[] = [];
  watchListMovies: any[] = [];
  showAddMovieModal = false;
  currentMovie: any;

  selectedMovie: any = null;
  constructor(private http: HttpClient, 
    private userService: UserService, 
    private serverService: ServerService
  ) { }



  ngOnInit(): void {
    this.username = this.userService.getUsername();

    this.welcomeMessage = "Welcome, " + this.username + ". These are the popular movies this week.";
    this.fetchPopularMovies();

    this.getWatchedMovies();
    this.getWatchListMovies();
  }
  

  fetchPopularMovies(): void {
    const apiUrl: string = `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=en-US&page=1`;

    this.http.get(apiUrl)
      .subscribe((data: any) => {
        this.movies = data.results.slice(0,6);
      }, error => {
        console.error('Error fetching popular movies:', error);
      });
  }

  movieDetailsUrl(movieId: number, movieName: string): string {
    return `https://www.themoviedb.org//movie/${movieId}` + movieName;
  }

  addWatched(movieId: string, rating: number) {
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      (response: any) => {
        if (response.message === 'Movie is already in the watched list') {
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


  selectMovie(movie: any) {
    this.selectedMovie = movie;
  }




  closeOptions() {
    this.selectedMovie = null;
  }

  isMovieWatched(movieId: string): boolean {
    return this.watchedMovies.some(movie => movie.movieId === String(movieId));
  }

  isMovieWatchList(movieId: string): boolean {
    return this.watchListMovies.some(movie => movie.movieId === String(movieId));
  }

  getMovieRating(movieId: string): number {
    const movie = this.watchedMovies.find(m => m.movieId === String(movieId));
    return movie ? movie.rating : 0;
  }
  
  openAddMovieModal(movie: any): void {
    this.showAddMovieModal = true;
    this.currentMovie = movie;
  }

  closeAddMovieModal() {
    this.showAddMovieModal = false;
    this.currentMovie = null;
  }

}

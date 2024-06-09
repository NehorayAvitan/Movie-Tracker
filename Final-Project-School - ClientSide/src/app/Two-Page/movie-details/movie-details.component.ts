import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MovieIdService } from '../movie-id.service';
import { TmdbService } from '../../tmdb.service';
import { UserService } from '../../user.service';
import { forkJoin, map } from 'rxjs';
import { ServerService } from '../../server.service';

@Component({
  selector: 'app-movie-details',
  templateUrl: './movie-details.component.html',
  styleUrls: ['./movie-details.component.css']
})
export class MovieDetailsComponent implements OnInit {
  username: string;
  movieId: number | null = null;
  movieName: string | null = null;
  movieDetails: any = null;
  watchedMovies: any[] = [];
  watchListMovies: any[] = [];


  constructor(private userService: UserService, 
    private route: ActivatedRoute, 
    private movieIdService: MovieIdService,
    private tmdbService: TmdbService,
    private serverService: ServerService,
  ) { }

  ngOnInit(): void {
    this.username = this.userService.getUsername();

    this.route.paramMap.subscribe(params => {
      this.movieName = params.get('movieName')?.replace(/-/g, ' ') || null;
      if (!this.movieName) {
        console.error('Movie name is undefined.');
      }
    });


  
    // Retrieve the movie ID from the shared service
    this.movieId = this.movieIdService.getMovieId();
    console.log(this.movieId);
    if (this.movieId) {
      this.fetchMovieDetails(this.movieId);
    } else {
      console.error('Movie ID is undefined.');
    }

    this.getWatchedMovies();
    this.getWatchListMovies();
  }

  getPosterUrl(posterPath: string): string {
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  fetchMovieDetails(movieId: number) {
    this.tmdbService.getMovieDetails(movieId.toString()).subscribe(
      (data) => {
        this.movieDetails = data;
        this.fetchMovieCredits(movieId);
        console.log('Fetched movie details:', this.movieDetails);
      },
      (error) => {
        console.error('Error fetching movie details:', error);
      }
    );
  }

  fetchMovieCredits(movieId: number) {
    this.tmdbService.getMovieCredits(movieId.toString()).subscribe(
      (credits) => {
        this.movieDetails.directors = credits.crew
          .filter((member: any) => member.job === 'Director')
          .map((director: any) => director.name);
        console.log('Fetched movie credits:', credits);
      },
      (error) => {
        console.error('Error fetching movie credits:', error);
      }
    );
  }

  rateMovie(event: MouseEvent, movieId: string, starIndex: number) {
    const starElement = event.target as HTMLElement;
    const starRect = starElement.getBoundingClientRect();
    const clickX = event.clientX - starRect.left;
    const starWidth = starRect.width;
    const rating = clickX < starWidth / 2 ? starIndex + 0.5 : starIndex + 1;
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      () => this.getWatchedMovies(),
      error => console.error('Error rating movie:', error)
    );
  }
  
  getStarClass(index: number): string {
    const rating = this.getMovieRating(this.movieDetails.id); // Assuming currentRating is your rating value out of 5
    if (index <= rating - 1) {
      return 'full';
    } else if (index < rating) {
      return 'half';
    } else {
      return 'empty';
    }
  }

  isMovieWatched(movieId: number): boolean {
    return this.watchedMovies.some(movie => movie.id === movieId);
  }

  isMovieWatchList(movieId: string): boolean {
    return this.watchListMovies.some(movie => movie.movieId === String(movieId));
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

  getMovieRating(movieId: string): number {
    const movie = this.watchedMovies.find(m => m.id === movieId);
    return movie ? movie.userRating : 0;
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



}

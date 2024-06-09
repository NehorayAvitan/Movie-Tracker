import { Component } from '@angular/core';
import { UserService } from '../../user.service';
import { ServerService } from '../../server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { TmdbService } from '../../tmdb.service';
import { map } from 'rxjs';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  userName: string;
  user: any = {};
  favoriteFilms: any[] = new Array(4).fill({});

  watchedMovies: any[] = [];
  watchListMovies: any[] = [];

  selectedMovie: any = null;




  constructor(private userService: UserService, 
    private serverService: ServerService,
    private tmdbService: TmdbService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
      this.userName = this.userService.getUsername();
      this.getUserByUsername(this.userName);
      this.loadFavoriteMovies();
      this.getWatchedMovies();
      this.getWatchListMovies();
  }

  loadFavoriteMovies() {
    this.serverService.getFavoriteMovies(this.userName).subscribe(
      (data: any) => {
        console.log(data.favoriteMovies);
        this.favoriteFilms = new Array(4).fill({});
  
        if (data && data.favoriteMovies && data.favoriteMovies.length > 0) {
          data.favoriteMovies.forEach((movie: string, index: number) => {
            console.log(movie)
            if (index < 4 && movie !== "0" && movie !== " 0") { 
              this.tmdbService.getMovieDetails(movie).pipe(
                map(movieDetails => ({
                  ...movieDetails,
                }))
              ).subscribe(movieDetails => {
                this.favoriteFilms[index] = movieDetails;
              });
            }
          });
        }
        console.log(this.favoriteFilms);
      },
      (error) => {
        console.error(error);
        this.favoriteFilms = new Array(4).fill({});
      }
    );
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

  getFirstFourFavoriteFilms() {
    const films = [...this.favoriteFilms];
    while (films.length < 4) {
      films.push({ posterUrl: null }); // Placeholder film object
    }
    return films.slice(0, 4);
  }

  isMainProfileView(): boolean {
    return this.route.snapshot.children.length === 0;
  }

  addWatched(movieId: string, rating: number) {
    this.serverService.addMovieToUser(this.userName, movieId, rating).subscribe(
      (response: any) => {
        if (response.message === 'Movie is already watched') {
          console.log('Movie is already watched');

          this.serverService.removeMovieToUser(this.userName, movieId).subscribe(
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
    this.serverService.addMovieToWatchList(this.userName, movieId).subscribe(
      (response: any) => {
        if (response.message === 'Movie is already in the watchlist') {
          console.log('Movie is already in the watch list');
        
          this.serverService.removeWatchListMovieToUser(this.userName, movieId).subscribe(
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
    this.serverService.getWatchlistMovies(this.userName).subscribe(
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
    this.serverService.getWatchedMovies(this.userName).subscribe(
      (data: any) => {
        if (data && data.watchedMovies && data.watchedMovies.length > 0) {
          this.watchedMovies = data.watchedMovies.map((movie: any) => ({
            movieId: movie.movieId,
            rating: movie.rating
          }));

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

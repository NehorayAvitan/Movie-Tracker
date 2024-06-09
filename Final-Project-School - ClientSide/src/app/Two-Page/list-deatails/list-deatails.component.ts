import { Component, OnInit } from '@angular/core';
import { UserService } from '../../user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ListIdService } from '../list-id.service';
import { TmdbService } from '../../tmdb.service';
import { ServerService } from '../../server.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-list-deatails',
  templateUrl: './list-deatails.component.html',
  styleUrls: ['./list-deatails.component.css']
})
export class ListDeatailsComponent implements OnInit {
  username: string;
  listId: number | null = null;
  listName: string | null = null;
  listDescription: string | null = null;
  movies: any[] = [];
  chunkedMovies: any[][] = [];

  watchedMovies: any[] = [];
  watchListMovies: any[] = [];

  selectedMovie: any = null;


  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private listIdService: ListIdService,
    private tmdbService: TmdbService,
    private serverService: ServerService,
  ) { }

  ngOnInit(): void {
    this.username = this.userService.getUsername();

    this.route.paramMap.subscribe(params => {
      this.listName = params.get('listName')?.replace(/-/g, ' ') || null;
      if (!this.listName) {
        console.error('List name is undefined.');
      } else {
        this.fetchListDetails();
      }
    });

    this.listId = this.listIdService.getListId();
  }

  fetchListDetails(): void {
    this.serverService.getList(this.username, this.listIdService.getListId()).subscribe(response => {
      console.log('Response from getListDetails:', response); // Debugging log
      this.listDescription = response.description;
      const movieIds = response.movies.split(','); // Split the movie IDs
      this.fetchMovieDetails(movieIds);
    }, error => {
      console.error('Error fetching list details:', error);
    });
  }

  fetchMovieDetails(movieIds: string[]): void {
    const movieDetailsObservables = movieIds.map(id => this.tmdbService.getMovieDetails(id.trim()));
    forkJoin(movieDetailsObservables).subscribe(movieDetails => {
      this.movies = movieDetails;
      this.chunkedMovies = this.chunk(this.movies, 5);
    }, error => {
      console.error('Error fetching movie details:', error);
    });
  }

  chunk(arr: any[], size: number): any[][] {
    return Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
      arr.slice(i * size, i * size + size)
    );
  }

  getPosterUrl(movie: any): string {
    return this.tmdbService.getMoviePosterUrl(movie.poster_path);
  }

  deleteList(): void {
    this.serverService.deleteList(this.username, this.listIdService.getListId()).subscribe(response => {
      console.log('List deleted:', response);
      window.history.back();
        }, error => {
      console.error('Error deleting list:', error);
    });
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

  addWatched(movieId: string, rating: number) {
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      (response: any) => {
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

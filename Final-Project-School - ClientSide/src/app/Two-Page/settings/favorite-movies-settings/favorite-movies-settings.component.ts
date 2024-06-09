import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../server.service';
import { TmdbService } from '../../../tmdb.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-favorite-movies-settings',
  templateUrl: './favorite-movies-settings.component.html',
  styleUrls: ['./favorite-movies-settings.component.css']
})
export class FavoriteMoviesSettingsComponent implements OnInit {
  favoriteFilms: any[] = new Array(4).fill({});
  showModal: boolean = false;
  searchQuery: string = '';
  searchResults: any[] = [];
  currentIndex: number;
  username: string;

  constructor(
    private serverService: ServerService,
    private tmdbService: TmdbService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.username = this.userService.getUsername();
    this.loadFavoriteMovies();
  }

  loadFavoriteMovies() {
    this.serverService.getFavoriteMovies(this.username)
      .subscribe(
        (data: any) => {
          if (data && data.favoriteMovies) {
            this.favoriteFilms = new Array(4).fill({});
            data.favoriteMovies.forEach((movie: any, index: number) => {
              if (movie != 0)
                {
              this.tmdbService.getMovieDetails(movie).subscribe(movieDetails => {
                this.favoriteFilms[index] = movieDetails;
              });
            }
            });
          } else {
            this.favoriteFilms = new Array(4).fill({});
          }
        },
        (error) => {
          console.error(error);
          this.favoriteFilms = new Array(4).fill({});
        }
      );
  }

  addMovieToFavorite(movie: any, index: number) {
    this.serverService.addFavoriteMovie(this.username, movie.id, index)
      .subscribe(
        (response) => {
          this.favoriteFilms[index] = movie;
          this.closeSearchModal();
        },
        (error) => {
          console.error(error);
        }
      );
  }

  removeMovieFromFavorite(movieId: string, index: number) {
    this.serverService.removeFavoriteMovie(this.username, movieId)
      .subscribe(
        (response) => {
          this.favoriteFilms[index] = {};
        },
        (error) => {
          console.error(error);
        }
      );
  }

  closeSearchModal() {
    this.showModal = false;
  }

  openSearchModal(index: number) {
    this.currentIndex = index;
    this.showModal = true;
  }

  searchMovies() {
    if (this.searchQuery.trim().length === 0) {
      this.searchResults = [];
      return;
    }

    this.tmdbService.searchMovies(this.searchQuery)
      .subscribe(
        (results) => {
          this.searchResults = results;
          this.searchResults.forEach((movie: any) => {
            this.fetchMovieCredits(movie.id);
          });
        },
        (error) => {
          console.error(error);
        }
      );
  }

  fetchMovieCredits(movieId: number) {
    this.tmdbService.getMovieCredits(movieId.toString()).subscribe(
      (credits) => {
        const directors = credits.crew
        .filter((member: any) => member.job === 'Director')
          .map((director: any) => director.name);

          const movie = this.searchResults.find((movie: any) => movie.id === movieId);
          if (movie) {
            movie.directors = directors;
          }
        console.log('Fetched movie credits:', credits);
      },
      (error) => {
        console.error('Error fetching movie credits:', error);
      }
    );
  }
}

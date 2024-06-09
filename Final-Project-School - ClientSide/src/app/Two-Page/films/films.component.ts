import { HttpClient } from '@angular/common/http';
import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { Observable, of } from 'rxjs';
import { UserService } from '../../user.service';
import { Router } from '@angular/router';
import { MovieIdService } from '../movie-id.service';
import { ServerService } from '../../server.service';

@Component({
  selector: 'app-films',
  templateUrl: './films.component.html',
  styleUrls: ['./films.component.css']
})
export class FilmsComponent {
  years: number[] = [];
  genres: any[] = [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' }
  ];
  rates: string[] = ['Top Rated', 'Bottom Rated'];
  submited: boolean = false;
  username: string;

  selectedValues: any = {
    title: '', // Track the selected movie title
    genreName: '', // Track the selected genre name
    ratingName: ''
  };

  @ViewChildren('inputTitle, inputYear, inputGenre, inputRate') inputFields: QueryList<ElementRef>;

  apiKey: string = '0b78940a4556c88d68e43fa555562746';
  private apiUrl = 'https://api.themoviedb.org/3';

  movies$: Observable<any>;
  watchedMovies: { movieId: string, rating: number }[] = [];
  watchListMovies: any[] = [];
  selectedMovie: any = null;

  showAddMovieModal = false;
  currentMovie: any;


  constructor(private http: HttpClient, 
    private userService: UserService, 
    private serverService: ServerService ) {
    this.movies$ = of([]);
  }

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.populateYears();
    this.getWatchedMovies();
    this.getWatchListMovies();
  }

  populateYears(): void {
    for (let i = 1900; i <= 2024; i++) {
      this.years.push(i);
    }
  }

  searchMovies(): void {
    this.submited = true;
    let url: string;

    const title = this.inputFields.toArray()[0].nativeElement.value;
    this.selectedValues.title = title;

    const year = this.inputFields.toArray()[1].nativeElement.value;

    const genreName = this.inputFields.toArray()[2].nativeElement.value;
    this.selectedValues.genreName = genreName;


    const rateName = this.inputFields.toArray()[3].nativeElement.value;
    this.selectedValues.ratingName = rateName;


     let params: any = { api_key: this.apiKey };

     const genre = this.genres.find(genre => genre.name.toLowerCase() === genreName.toLowerCase());
    
    console.log(rateName) 
    if (title !== '')
      {
        params.query = title;
        params.primary_release_year = year;
        url = `${this.apiUrl}/search/movie`;
      }
    else {
      params.primary_release_year = year;
      if (genreName)
        {
          params.with_genres = genre.id;
        }
      
      if (rateName == 'Top Rated')
        {
            params.sort_by = 'vote_average.desc';
            params['vote_count.gte'] = 400;        
        }
        else if (rateName == 'Bottom Rated')
        {
          params.sort_by = 'vote_average.asc';
          params['vote_count.gte'] = 400;        
        }

        url = `${this.apiUrl}/discover/movie`;

    }

    let allData: any[] = []; 

    for (let p = 1; p <= 3; p++) {
      params.page = p;
      this.http.get(url, { params }).subscribe((data: any) => {

        allData.push(...data.results);
        
        if (p === 3) {
          const chunkSize = 6;
          const movieChunks = [];
          for (let i = 0; i < allData.length; i += chunkSize) {
            movieChunks.push(allData.slice(i, i + chunkSize));
          }
          this.movies$ = of(movieChunks);
        }
      }, error => {
        console.error('Error fetching movies:', error);
      });
    }
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
  


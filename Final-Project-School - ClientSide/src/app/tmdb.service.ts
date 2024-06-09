import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  apiKey: string = '0b78940a4556c88d68e43fa555562746';
  private apiUrl = 'https://api.themoviedb.org/3';
  private imageUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient) { }

  getMovieDetails(movieId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/${movieId}?api_key=${this.apiKey}`).pipe(
      map((response: any) => response)
    );
  }

  getMovieCredits(movieId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/movie/${movieId}/credits?api_key=${this.apiKey}`).pipe(
      map((response: any) => response)
    );
  }

  searchMovies(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/search/movie`, { params: { api_key: this.apiKey, query } }).pipe(
      map((response: any) => response.results)
    );
  }

  getMoviePosterUrl(posterPath: string): string {
    return `${this.imageUrl}${posterPath}`;
  }
}

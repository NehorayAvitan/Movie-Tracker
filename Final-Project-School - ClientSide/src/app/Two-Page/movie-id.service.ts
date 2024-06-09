import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovieIdService {
  private movieId: number | null = null;

  setMovieId(id: number) {
    this.movieId = id;
  }

  getMovieId(): number | null {
    return this.movieId;
  }
}

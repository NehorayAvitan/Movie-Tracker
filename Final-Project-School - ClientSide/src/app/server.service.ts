import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EncryptionService } from './encryption.service'; 

@Injectable({
  providedIn: 'root'
})
export class ServerService {

  private serverUrl = 'http://127.0.0.1:3000';

  constructor(private http: HttpClient, private encryptionService: EncryptionService) {} 

  login(username: string, password: string)
  {
    const url = `${this.serverUrl}/login`;
    const encryptedUsername = this.encryptionService.encrypt({ username, password});
    return this.http.post<any>(url, {data: encryptedUsername }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  } 

  getUserByUsername(username: string): Observable<any> {
    const url = `${this.serverUrl}/users`;
    const encryptedUsername = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: {data: encryptedUsername }}).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getUserStats(username: string): Observable<any> {
    const url = `${this.serverUrl}/userStats`;
    const encryptedUsername = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedUsername } }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getUserLogs(username: string): Observable<any> {
    const url = `${this.serverUrl}/logs`;
    const encryptedUsername = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedUsername } }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  addMovieToUser(username: string, movieId: string, rating: number) {
    console.log(username, movieId, rating);
    const url = `${this.serverUrl}/users/${username}/moviesWatched`;
    const encryptedData = this.encryptionService.encrypt({ movieId, rating });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  addMovieToWatchList(username: string, movieId: string){
    const url = `${this.serverUrl}/users/${username}/moviesWatchlist`;
    const encryptedData = this.encryptionService.encrypt({ movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getWatchedMovies(username: string) {
    const url = `${this.serverUrl}/users/${username}/moviesWatched`;
    const encryptedUsername = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedUsername } }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getWatchlistMovies(username: string) {
    const url = `${this.serverUrl}/users/${username}/moviesWatchlist`;
    const encryptedUsername = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedUsername } }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  removeMovieToUser(username: string, movieId: string) {
    const url = `${this.serverUrl}/users/${username}/removeWatchedMovie`;
    const encryptedData = this.encryptionService.encrypt({ movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  removeWatchListMovieToUser(username: string, movieId: string) {
    const url = `${this.serverUrl}/users/${username}/removeMoviesWatchlist`;
    const encryptedData = this.encryptionService.encrypt({ movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  updateUser(user: any){
    const url = `${this.serverUrl}/users/${user.username}`;
    const encryptedUser = this.encryptionService.encrypt(user);
    return this.http.put<any>(url, { data: encryptedUser }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  addFavoriteMovie(username: string, movieId: string, index: number): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/addFavoriteMovie`;
    const encryptedData = this.encryptionService.encrypt({ movieId, index });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }
  
  removeFavoriteMovie(username: string, movieId: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/removeFavoriteMovie`;
    const encryptedData = this.encryptionService.encrypt({ movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }
  
  getFavoriteMovies(username: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/favoriteMovies`;
    const encryptedData = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedData } }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  addMovieToList(username: string, listId: number, movieId: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists/addMovie`;
    const encryptedData = this.encryptionService.encrypt({ listId, movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getUserLists(username: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists`;
    console.log(username)
    const encryptedData = this.encryptionService.encrypt({ username });
    return this.http.get<any>(url, { params: { data: encryptedData }}).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  getList(username: string, listId: number): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists/${listId}`;
    const encryptedData = this.encryptionService.encrypt({ username,  listId});
    return this.http.get<any>(url, { params: { data: encryptedData }}).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  removeMovieFromList(username: string, listId: number, movieId: string): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists/removeMovie`;
    const encryptedData = this.encryptionService.encrypt({ listId, movieId });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }


  createList(username: string, listName: number, description: string, isPublic: boolean): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists/create`;
    const encryptedData = this.encryptionService.encrypt({ listName, description, isPublic });
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

  deleteList(username: string, listId: number): Observable<any> {
    const url = `${this.serverUrl}/users/${username}/lists/delete`;
    const encryptedData = this.encryptionService.encrypt({listId});
    return this.http.post<any>(url, { data: encryptedData }).pipe(
      map(response => this.encryptionService.decrypt(response.data))
    );
  }

}
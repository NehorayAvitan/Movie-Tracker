// film-options-dropdown.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { ServerService } from '../../server.service';
import { MovieIdService } from '../movie-id.service';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-film-options-dropdown',
  templateUrl: './film-options-dropdown.component.html',
  styleUrls: ['./film-options-dropdown.component.css']
})
export class FilmOptionsDropdownComponent {
  @Input("movie") movie: any;
  @Input("selectedMovieRating") selectedMovieRating: number;
  @Output() closeOptions = new EventEmitter<void>();
  @Output() refreshWatchedMovies = new EventEmitter<void>();
  @Output() addToList = new EventEmitter<any>();


  username: string;
  constructor(
    private userService: UserService,
    private serverService: ServerService,
    private movieIdService: MovieIdService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.userService.getUsername();
  }

  getStarClass(index: number): string {
    const rating = this.selectedMovieRating; 
    if (index <= rating - 1) {
      return 'full';
    } else if (index < rating) {
      return 'half';
    } else {
      return 'empty';
    }
  }

  rateMovie(event: MouseEvent, movieId: string, starIndex: number): void {
    const starElement = event.target as HTMLElement;
    const starRect = starElement.getBoundingClientRect();
    const clickX = event.clientX - starRect.left;
    const starWidth = starRect.width;
    const rating = clickX < starWidth / 2 ? starIndex + 0.5 : starIndex + 1;
    this.selectedMovieRating = rating;
    console.log(movieId);
    this.serverService.addMovieToUser(this.username, movieId, rating).subscribe(
      () => this.refreshWatchedMovies.emit(),
      error => console.error('Error rating movie:', error)
    );
  }

  addMovieToList(movie: any): void {
    this.addToList.emit(movie);
  }

  goToMovie(film: any): void {
    console.log(film);
    if (film && film.title) {
      const formattedTitle = film.title.replace(/\s+/g, '-');
      this.movieIdService.setMovieId(film.id);
      this.router.navigate(['/film', formattedTitle]);
    } else {
      console.error('Movie title is undefined.');
    }
  }



  closeDropdown(): void {
    this.closeOptions.emit();
  }
}

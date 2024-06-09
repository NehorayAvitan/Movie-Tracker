import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { ServerService } from '../../../server.service';
import { UserService } from '../../../user.service';

@Component({
  selector: 'app-add-movie-to-list-modal',
  templateUrl: './add-movie-to-list-modal.component.html',
  styleUrls: ['./add-movie-to-list-modal.component.css']
})
export class AddMovieToListModalComponent implements OnInit {
  @Input() movie: any;
  @Output() closeModalEvent = new EventEmitter<void>();
  userLists: any[] = [];
  selectedList: any = null;
  username: string;

  constructor(
    private serverService: ServerService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.fetchUserLists();
  }

  fetchUserLists(): void {
    this.serverService.getUserLists(this.username).subscribe(response => {
      this.userLists = response.lists || [];
    }, error => {
      console.error('Error fetching user lists:', error);
    });
  }

  selectList(list: any): void {
    this.selectedList = list;
  }

  addMovieToList(): void {
    if (this.selectedList && this.movie) {
      console.log("Added....")
      console.log(this.movie);
      this.serverService.addMovieToList(this.username, this.selectedList.id, this.movie.id).subscribe(response => {
        console.log(`Movie added to list: ${response}`);
        this.closeModalEvent.emit();
      }, error => {
        console.error('Error adding movie to list:', error);
      });
    }
  }

  getNumberOfMovies(list: any)
  {
    const movieIds = list.movies ? list.movies.split(',') : [];
    return movieIds.length;

  }

  closeModal(): void {
    this.closeModalEvent.emit();
  }
}

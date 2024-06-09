import { Component, OnInit } from '@angular/core';
import { ServerService } from '../../../server.service';
import { TmdbService } from '../../../tmdb.service';
import { UserService } from '../../../user.service';
import { ListIdService } from '../../list-id.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lists-profile',
  templateUrl: './lists-profile.component.html',
  styleUrls: ['./lists-profile.component.scss']
})
export class ListsProfileComponent implements OnInit {
  lists: any[] = [];
  username: string;

  constructor(
    private userService: UserService,
    private serverService: ServerService, 
    private tmdbService: TmdbService,
    private listIdService: ListIdService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.fetchUserLists();
  }

  fetchUserLists(): void {
    this.serverService.getUserLists(this.username).subscribe(
      response => {
        console.log('Response from getUserLists:', response);
        if (response && Array.isArray(response.lists)) {
          this.processLists(response.lists);
        } else {
          console.error('Expected an object with a lists array but got:', response);
        }
      },
      error => {
        console.error('Error fetching user lists:', error);
      }
    );
  }

  processLists(lists: any[]): void {
    lists.forEach((list: any) => {
      const movieIds = list.movies ? list.movies.split(',') : [];
      const posterUrls: string[] = [];
      const fetchPosters = movieIds.slice(0, 5).map(movieId => 
        this.tmdbService.getMovieDetails(movieId).toPromise().then(movie => 
          posterUrls.push(movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null)
        )
      );
      console.log
      Promise.all(fetchPosters).then(() => {
        while (posterUrls.length < 5) {
          posterUrls.push(null); // Use null for empty placeholders
        }
        this.lists.push({
          ...list,
          posters: posterUrls
        });
      });
    });
  }

  getNumberOfMovies(list: any)
  {
    const movieIds = list.movies ? list.movies.split(',') : [];
    return movieIds.length;

  }

  GoToList(list: any)
  {
    if (list && list.listName) {
      const formattedName = list.listName.replace(/\s+/g, '-');
      this.listIdService.setListId(list.id);
      this.router.navigate(['/list', formattedName]);
    } else {
      console.error('List name is undefined.');
    }
  }
  
}

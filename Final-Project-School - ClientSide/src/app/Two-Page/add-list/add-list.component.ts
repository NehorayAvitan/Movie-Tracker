import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TmdbService } from '../../tmdb.service';
import { ServerService } from '../../server.service'; // Import the ServerService
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { UserService } from '../../user.service';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.component.html',
  styleUrls: ['./add-list.component.css']
})
export class AddListComponent implements OnInit {
  username: string;
  searchQuery: string = '';
  searchResults: any[] = [];
  selectedMovies: any[] = [];
  showModal: boolean = false;
  currentIndex: number = -1;
  movieCounter: number = 1; // Initialize movie counter

  // Form group for the list
  listForm: FormGroup;
  formSubmitted: boolean = false; // Track form submission

  constructor(
    private fb: FormBuilder,
    private tmdbService: TmdbService,
    private serverService: ServerService,
    private userService: UserService 
  ) {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }

  searchSubject: Subject<string> = new Subject<string>();

  ngOnInit(): void {
    this.username = this.userService.getUsername();
    this.listForm = this.fb.group({
      listName: ['', Validators.required],
      description: [''],
      visibility: ['public', Validators.required]
    });
  }

  searchMovies() {
    this.searchSubject.next(this.searchQuery);
  }

  performSearch(query: string) {
    if (query.trim().length < 2) {
      this.searchResults = [];
      return;
    }

    this.tmdbService.searchMovies(query)
      .subscribe(
        (results) => {
          this.searchResults = results.slice(0, 20); // Limit results to top 20
          this.searchResults.forEach((movie: any) => {
            this.fetchMovieCredits(movie.id);
          });

          if (this.searchResults.length > 0) {
            document.querySelector('.search-results').classList.add('show');
          } else {
            document.querySelector('.search-results').classList.remove('show');
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  addMovieToList(movie: any) {
    if (!this.selectedMovies.some(selected => selected.id === movie.id)) {
      this.selectedMovies.push({ ...movie, number: this.movieCounter }); // Add movie with number
      this.movieCounter++; // Increment movie counter
    }
    this.clearSearch();
  }

  removeMovieFromList(movieId: number) {
    this.selectedMovies = this.selectedMovies.filter(movie => movie.id !== movieId);
    this.updateMovieNumbers();
  }

  updateMovieNumbers() {
    this.selectedMovies.forEach((movie, index) => {
      movie.number = index + 1;
    });
    this.movieCounter = this.selectedMovies.length + 1;
  }

  closeSearchModal() {
    this.showModal = false;
  }

  openSearchModal(index: number) {
    this.currentIndex = index;
    this.showModal = true;
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

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    const searchResultsElement = document.querySelector('.search-results');
    if (searchResultsElement) {
      searchResultsElement.classList.remove('show');
    }
  }

  saveList() {
    this.formSubmitted = true;
    if (this.listForm.invalid) {
      console.log('Form is invalid');
      return;
    }

    const listData = {
      name: this.listForm.value.listName,
      description: this.listForm.value.description,
      visibility: this.listForm.value.visibility,
      movies: this.selectedMovies.map(movie => movie.id) // Assuming you only need movie IDs
    };

    const isPublic = listData.visibility === 'public';

    this.serverService.createList(this.username, listData.name, listData.description, isPublic).subscribe(
      (response) => {
        console.log('List created successfully:', response);
        const listId = response.listId; // Assuming the response contains the created list ID

        // Add each selected movie to the created list
        this.selectedMovies.forEach(movie => {
          this.serverService.addMovieToList(this.username, listId, movie.id.toString()).subscribe(
            (addMovieResponse) => {
              console.log(`Movie ${movie.id} added to the list successfully:`, addMovieResponse);
            },
            (addMovieError) => {
              console.error(`Error adding movie ${movie.id} to the list:`, addMovieError);
            }
          );
        });

        // Optionally, navigate to the list page or clear the form
      },
      (error) => {
        console.error('Error creating list:', error);
      }
    );
  }

  cancel() {
    window.history.back();
  }
}

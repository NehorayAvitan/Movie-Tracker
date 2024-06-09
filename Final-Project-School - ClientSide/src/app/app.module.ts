import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { HeaderComponent } from './First-Page/header/header.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './First-Page/login/login.component';
import { SignUpComponent } from './First-Page/sign-up/sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import {RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './Two-Page/home/home.component';
import { ProfileComponent } from './Two-Page/profile/profile.component';
import { FilmsComponent } from './Two-Page/films/films.component';
import { SettingsComponent } from './Two-Page/settings/settings.component';
import { AuthSettingsComponent } from './Two-Page/settings/auth-settings/auth-settings.component';
import { AvatarSettingsComponent } from './Two-Page/settings/avatar-settings/avatar-settings.component';
import { FilmsProfileComponent } from './Two-Page/profile/films-profile/films-profile.component';
import { WatchlistProfileComponent } from './Two-Page/profile/watchlist-profile/watchlist-profile.component';
import { MovieDetailsComponent } from './Two-Page/movie-details/movie-details.component';
import { ActivityProfileComponent } from './Two-Page/profile/activity-profile/activity-profile.component';
import { TimeAgoPipe } from './Two-Page/profile/activity-profile/time-ago.pipe';
import { MainNavbarComponent } from './Two-Page/main-navbar/main-navbar.component';
import { HeaderProfileComponent } from './Two-Page/profile/header-profile/header-profile.component';
import { HeaderSettingsComponent } from './Two-Page/settings/header-settings/header-settings.component';
import { FavoriteMoviesSettingsComponent } from './Two-Page/settings/favorite-movies-settings/favorite-movies-settings.component';
import { FilmOptionsDropdownComponent } from './Two-Page/film-options-dropdown/film-options-dropdown.component';
import { ListsProfileComponent } from './Two-Page/profile/lists-profile/lists-profile.component';
import { AddListComponent } from './Two-Page/add-list/add-list.component';
import { ListDeatailsComponent } from './Two-Page/list-deatails/list-deatails.component';
import { AddMovieToListModalComponent } from './Two-Page/film-options-dropdown/add-movie-to-list-modal/add-movie-to-list-modal.component';


const appRoutes: Routes = [
{path: '', component: AppComponent},
{path: 'home', component: HomeComponent},
{
  path: 'profile',
  component: ProfileComponent,
  children: [
    { path: '', redirectTo: 'profile', pathMatch: 'full' }, // Redirect to default child route if needed
    { path: 'films', component: FilmsProfileComponent },
    { path: 'watchlist', component: WatchlistProfileComponent },
    { path: 'activity', component: ActivityProfileComponent },
    {path: 'lists', component: ListsProfileComponent}
  ]
},
{path: 'films', component: FilmsComponent},
{path: 'settings',
component: SettingsComponent,
children: [
  { path: '', redirectTo: 'settings', pathMatch: 'full' },
  { path: 'auth', component: AuthSettingsComponent },
  { path: 'avatar', component: AvatarSettingsComponent },
  {path: 'favoriteMovies', component: FavoriteMoviesSettingsComponent}
]
},
{path: 'film/:movieName', component: MovieDetailsComponent },
{ path: 'list/new', component: AddListComponent },
{path:'list/:listName', component: ListDeatailsComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    SignUpComponent,
    HomeComponent,
    ProfileComponent,
    FilmsComponent,
    SettingsComponent,
    AuthSettingsComponent,
    AvatarSettingsComponent,
    FilmsProfileComponent,
    WatchlistProfileComponent,
    MovieDetailsComponent,
    ActivityProfileComponent,
    TimeAgoPipe,
    MainNavbarComponent,
    HeaderProfileComponent,
    HeaderSettingsComponent,
    FavoriteMoviesSettingsComponent,
    FilmOptionsDropdownComponent,
    ListsProfileComponent,
    AddListComponent,
    ListDeatailsComponent,
    AddMovieToListModalComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(appRoutes),
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

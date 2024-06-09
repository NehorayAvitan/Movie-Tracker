import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ListIdService {
  private listId: number | null = null;

  setListId(id: number) {
    this.listId = id;
  }

  getListId(): number | null {
    return this.listId;
  }

  constructor() { }
}

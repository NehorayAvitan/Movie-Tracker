import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo'
})
export class TimeAgoPipe implements PipeTransform {

  transform(value: string): string {
    const seconds = Math.floor((+new Date() - +new Date(value)) / 1000);

    let interval = seconds / 31536000;

    if (interval > 1) {
      return Math.floor(interval) + 'y';
    }
    interval = seconds / 2592000;
    if (interval > 1) {
      return Math.floor(interval) + 'm';
    }
    interval = seconds / 86400;
    if (interval > 1) {
      return Math.floor(interval) + 'd';
    }
    interval = seconds / 3600;
    if (interval > 1) {
      return Math.floor(interval) + 'h';
    }
    interval = seconds / 60;
    if (interval > 1) {
      return Math.floor(interval) + 'm';
    }
    return Math.floor(seconds) + 's';
  }
}

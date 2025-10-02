import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {

  private darkMode$ = new BehaviorSubject<boolean>(
    document.documentElement.classList.contains('dark')
  );

  get isDarkMode$() {
    return this.darkMode$.asObservable();
  }

  toggleDarkMode(): void {
    const isDark = document.documentElement.classList.toggle('dark');
    this.darkMode$.next(isDark);
  }
}

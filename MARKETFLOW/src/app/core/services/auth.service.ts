import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';

const USER_STORAGE_KEY = 'marketflow.user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly userSubject = new BehaviorSubject<string | null>(this.restoreUser());

  readonly user$: Observable<string | null> = this.userSubject.asObservable();
  readonly isLoggedIn$: Observable<boolean> = this.user$.pipe(map((email) => email !== null));

  login(email: string): void {
    const normalizedEmail = email.trim().toLowerCase();

    this.userSubject.next(normalizedEmail);

    try {
      localStorage.setItem(USER_STORAGE_KEY, normalizedEmail);
    } catch {
      return;
    }
  }

  logout(): void {
    this.userSubject.next(null);

    try {
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      return;
    }
  }

  isLoggedIn(): boolean {
    return this.userSubject.value !== null;
  }

  getUser(): string | null {
    return this.userSubject.value;
  }

  private restoreUser(): string | null {
    try {
      return localStorage.getItem(USER_STORAGE_KEY);
    } catch {
      return null;
    }
  }
}

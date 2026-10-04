import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Component({
  selector: 'app-login',
  imports: [RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      void this.router.navigateByUrl(this.returnUrl());
    }
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  onPasswordInput(event: Event): void {
    this.password.set((event.target as HTMLInputElement).value);
    this.errorMessage.set('');
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  submit(event: Event): void {
    event.preventDefault();

    const email = this.email().trim();

    if (!EMAIL_PATTERN.test(email)) {
      this.errorMessage.set('Ingresa un correo electrónico válido.');
      return;
    }

    if (this.password().length < 4) {
      this.errorMessage.set('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    this.authService.login(email);
    this.toastService.show(`Bienvenido, ${email}`);
    void this.router.navigateByUrl(this.returnUrl());
  }

  private returnUrl(): string {
    return this.route.snapshot.queryParamMap.get('returnUrl') ?? '/tienda';
  }
}

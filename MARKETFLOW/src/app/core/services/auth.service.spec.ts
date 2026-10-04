import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
  });

  it('arranca sin sesión', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getUser()).toBeNull();
  });

  it('inicia sesión normalizando el correo y persiste', () => {
    service.login('  Cliente@MarketFlow.com ');

    expect(service.isLoggedIn()).toBe(true);
    expect(service.getUser()).toBe('cliente@marketflow.com');
    expect(localStorage.getItem('marketflow.user')).toBe('cliente@marketflow.com');
  });

  it('cierra sesión y limpia el almacenamiento', () => {
    service.login('cliente@marketflow.com');

    service.logout();

    expect(service.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('marketflow.user')).toBeNull();
  });

  it('restaura una sesión previamente guardada', () => {
    localStorage.setItem('marketflow.user', 'guardado@marketflow.com');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});

    const restoredService = TestBed.inject(AuthService);

    expect(restoredService.getUser()).toBe('guardado@marketflow.com');
  });
});

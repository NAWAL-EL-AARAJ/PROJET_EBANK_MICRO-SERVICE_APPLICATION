import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from './notification.service';

// L'API n'a pas d'authentification (pas de token à ajouter) :
// l'interceptor sert à afficher un message lisible pour toute erreur HTTP.
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notifications = inject(NotificationService);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      notifications.error(describe(err));
      return throwError(() => err);
    }),
  );
};

function describe(err: HttpErrorResponse): string {
  if (err.status === 0) {
    return 'Gateway injoignable (http://localhost:9999) : vérifier que les services sont lancés.';
  }
  if (err.status === 503) {
    return 'Service indisponible : il n\'est pas (encore) enregistré dans Eureka.';
  }
  if (err.status === 404) {
    return 'Ressource introuvable.';
  }
  if (err.status >= 500) {
    return `Erreur serveur (${err.status}) : la ressource n'existe pas ou un service a échoué.`;
  }
  return `Erreur ${err.status} : ${err.statusText}`;
}

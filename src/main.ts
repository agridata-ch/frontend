import { bootstrapApplication } from '@angular/platform-browser';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';

import { AppComponent } from '@/app/app.component';
import { appConfig } from '@/app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then((appRef) => {
    const router = appRef.injector.get(Router);
    const overlay = document.getElementById('app-loading');

    const hideOverlay = () => {
      if (!overlay) return;
      overlay.classList.add('fade-out');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
    };

    // Keep overlay visible until the first navigation finishes (guards + UID call included)
    const sub = router.events.subscribe((e) => {
      if (
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ) {
        hideOverlay();
        sub.unsubscribe();
      }
    });
  })
  .catch((err) => {
    console.log(err);
  });

import { bootstrapApplication } from '@angular/platform-browser';

import { AppComponent } from '@/app/app.component';
import { appConfig } from '@/app/app.config';

bootstrapApplication(AppComponent, appConfig)
  .then(() => {
    // Remove loading overlay once Angular has bootstrapped
    const overlay = document.getElementById('app-loading');
    if (overlay) {
      overlay.classList.add('fade-out');
      // Remove from DOM after transition completes
      overlay.addEventListener('transitionend', () => {
        overlay.remove();
      });
    }
  })
  .catch((err) => console.error(err));

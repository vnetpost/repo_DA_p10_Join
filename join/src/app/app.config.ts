import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes), provideFirebaseApp(() => initializeApp({ projectId: "join-4d381", appId: "1:424862204371:web:fec3613f70b8c42df26f26", storageBucket: "join-4d381.firebasestorage.app", apiKey: "AIzaSyC3a_L4kha0fw5Wm5GxUhDX_9Ak4o6VEVM", authDomain: "join-4d381.firebaseapp.com", messagingSenderId: "424862204371", projectNumber: "424862204371", version: "2" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore())
  ]
};

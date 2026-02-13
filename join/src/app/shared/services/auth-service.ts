import { inject, Injectable } from '@angular/core';
import { Auth, authState, createUserWithEmailAndPassword, signInAnonymously, signInWithEmailAndPassword, signOut, updateProfile, UserCredential } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';
import { FirebaseService } from './firebase-service';
import { capitalizeFullname, setUserColor } from '../utilities/utils';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  firebaseAuth = inject(Auth);
  contactService = inject(FirebaseService);
  user$ = authState(this.firebaseAuth);

  logIn(email: string, password: string): Observable<UserCredential> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password);
    return from(promise);
  }

  guestLogIn(): Observable<UserCredential> {
    const promise = signInAnonymously(this.firebaseAuth);
    return from(promise);
  }

  signUp(name: string, email: string, password: string): Observable<UserCredential> {
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email,password
    ).then(async (response) => {
      await updateProfile(response.user, {displayName: name});
      
      await this.contactService.addDocument({
        name: capitalizeFullname(name),
        email: email,
        phone: '',
        isAvailable: true,
        userColor: setUserColor()
      });

      return response;
    });

    return from(promise);
  }

  logout(): Observable<void> {
    const promise = signOut(this.firebaseAuth);
    return from(promise);
  }
} 



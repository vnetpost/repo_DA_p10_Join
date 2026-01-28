import { inject, Injectable } from '@angular/core';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  Firestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Contact } from '../interfaces/contact';
import { Unsubscribe } from '@angular/fire/auth';
import { capitalizeFullname, setUserColor, userColors } from '../utilities/utils';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  contacts: Array<Contact> = [];

  unsubCollection!: Unsubscribe;

  constructor() {
    this.unsubCollection = this.subCollection();
  }

  subCollection() {
    const contactsQuery = query(
      this.getContactsRef(),
      where('isAvailable', '==', true),
      orderBy('name', 'asc'),
      limit(15),
    );

    return onSnapshot(contactsQuery, (snapshot) => {
      this.contacts.length = 0;
      snapshot.forEach((contact) => {
        this.contacts.push(this.mapContactObj(contact.data(), contact.id));
      });
      console.log(this.contacts);

      // list.docChanges().forEach((change) => {
      //   if (change.type === "added") {
      //       console.log("New contact: ", change.doc.data());
      //   }
      //   if (change.type === "modified") {
      //       console.log("Modified contact: ", change.doc.data());
      //   }
      //   if (change.type === "removed") {
      //       console.log("Removed contact: ", change.doc.data());
      //   }
      // });
    });
  }

  subSingleDoc(colId: string, docId: string) {
    return onSnapshot(this.getSingleDocRef(colId, docId), (element) => {
      console.log(element);
    });
  }

  mapContactObj(obj: any, id: string): Contact {
    return {
      id: id,
      name: capitalizeFullname(obj.name) || '',
      email: obj.email || '',
      phone: obj.phone || '',
      isAvailable: obj.isAvailable || false,
      userColor: obj.userColor || null,
    };
  }

  /////////////////////////////

  /////////////////////////////

  async deleteDocument(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  // später item: Contact | Task
  async updateDocument(item: Contact, colId: string) {
    if (item.id) {
      let docRef = this.getSingleDocRef(colId, item.id);
      await updateDoc(docRef, this.getCleanJson(item))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  // später entweder type contact oder type task
  getCleanJson(contact: Contact): {} {
    return {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isAvailable: contact.isAvailable,
      userColor: contact.userColor,
    };
  }

  // später: Prüffunktion, ob Kontakt schon vorhanden ist
  async addDocument(item: Contact) {
    await addDoc(this.getContactsRef(), item)
      .catch((err) => {
        console.error(err);
      })
      .then((docRef) => {
        console.log('Document written with ID: ', docRef?.id);
      });
  }

  ngOnDestroy() {
    this.unsubCollection();
  }

  getContactsRef() {
    return collection(this.firestore, 'contacts');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

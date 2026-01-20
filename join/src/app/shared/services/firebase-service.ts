import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Contact } from '../interfaces/contact';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class FirebaseService {
  firestore: Firestore = inject(Firestore);

  contacts: Array<Contact> = [];

  unsubCollection!: Unsubscribe;
  unsubSingle!: Unsubscribe;

  constructor() {
    this.unsubCollection = this.subCollection();
    // this.unsubSingle = this.subSingleDoc();
  }

  subCollection(){ 
    return onSnapshot(this.getContactsRef(), (list) => {
      this.contacts = [];
      list.forEach((element) => {
        this.contacts.push(this.setContactsObject(element.data(), element.id));
      });
      list.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New contact: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified contact: ", change.doc.data());
        }
        if (change.type === "removed") {
            console.log("Removed contact: ", change.doc.data());
        }
      });
    });
  }

  subSingleDoc(colId: string, docId: string){
    return onSnapshot(this.getSingleDocRef(colId, docId), 
    (element) => {
      console.log(element);
    })
  }

  setContactsObject(obj: any, id: string): Contact{
    return {
      id: id,
      name: obj.name || "contact",
      email: obj.email || "",
      phone: obj.phone || "",
      isAvailable: obj.isAvailable || false,
      // color: this.setUserColor(),
    }
  }

  setUserColor(){
    // return random()
  }

  async deleteDocument(colId: string, docId: string){
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch(
      (err) => {console.log(err)}
    )
  }

  // später item: Contact | Task
  async updateDocument(item: Contact, colId: string){
    if(item.id){
      let docRef = this.getSingleDocRef(colId, item.id)
      await updateDoc(docRef, this.getCleanJson(item)).catch(
        (err) => { console.log(err); }
      ).then();
    }
  }

  // später entweder type contact oder type task
  getCleanJson(contact: Contact):{}{
    return {
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      isAvailable: contact.isAvailable,
    }
  }

  // später: Prüffunktion, ob Kontakt schon vorhanden ist
  async addDocument(item: Contact){
    await addDoc(this.getContactsRef(), item).catch(
        (err) => { console.error(err) }
      ).then(
        (docRef) => {console.log("Document written with ID: ", docRef?.id)}
      )
  }
  
  ngOnDestroy(){
    this.unsubCollection();
    this.unsubSingle();
  }
  
  
  getContactsRef(){
    return collection(this.firestore, 'contacts');
  }

  getSingleDocRef(colId:string, docId:string){
    return doc(collection(this.firestore, colId), docId);
  }
}



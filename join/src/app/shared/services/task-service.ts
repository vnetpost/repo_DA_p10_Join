import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Subtask, Task } from '../interfaces/task';
import { Unsubscribe } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  firestore: Firestore = inject(Firestore);
  tasks: Array<Task> = [];
  // tasksVersion = 0;
  unsubCollection!: Unsubscribe;
  loading = true;

  constructor() {
    this.unsubCollection = this.subCollection();
  }

  subCollection() {
    this.loading = true;

    const tasksQuery = query(
      this.getTasksRef(),
      // where('isAvailable', '==', true),
      // orderBy('name', 'asc'),
    );

    return onSnapshot(tasksQuery, (snapshot) => {
      this.tasks.length = 0;
      snapshot.forEach((task) => {
        this.tasks.push(this.mapTaskObj(task.data(), task.id));
      });
      this.loading = false;
      // this.tasksVersion += 1;
    });
  }

  mapTaskObj(obj: any, id: string): Task {
    return {
      id: id,
      status: obj.status || '',
      title: obj.title || '',
      description: obj.description || '',
      dueDate: obj.dueDate || null,
      priority: obj.priority || '',
      assignees: obj.assignees || Array<string>,
      category: obj.category || '',
      subtasks: obj.subtasks || Array<Subtask>,
    }
  }

  async deleteDocument(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

  // später item: Task | Task
  async updateDocument(item: Task, colId: string) {
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
  getCleanJson(task: Task): {} {
    return {
      status: task.status,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignees: task.assignees,
      category: task.category,
      subtasks: task.subtasks,
    };
  }

  async addDocument(item: Task) {
    try {
      const docRef = await addDoc(this.getTasksRef(), item);
      return docRef.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  }

  ngOnDestroy() {
    this.unsubCollection();
  }

  getTasksRef() {
    return collection(this.firestore, 'tasks');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

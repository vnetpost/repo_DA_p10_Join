import { inject, Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, Firestore, onSnapshot, orderBy, query, updateDoc, where } from '@angular/fire/firestore';
import { Subtask, Task } from '../interfaces/task';
import { Unsubscribe } from '@angular/fire/auth';

export type TaskCategoryOption = { value: Task['category']; label: string };

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  firestore: Firestore = inject(Firestore);
  tasks: Array<Task> = [];
  taskCategories: TaskCategoryOption[] = [
    { value: 'technical-task', label: 'Technical Task' },
    { value: 'user-story', label: 'User Story' },
  ];
  // tasksVersion = 0;
  unsubCollection!: Unsubscribe;
  loading = true;
  searchTerm: string = '';

  constructor() {
    this.unsubCollection = this.subCollection();
  }

  getFilteredTasks() {
    if (!this.searchTerm) return this.tasks;

    return this.tasks.filter((task) => {
      return (
        task.title.toLowerCase().includes(this.searchTerm) ||
        task.description.toLowerCase().includes(this.searchTerm)
      );
    });
  }

  subCollection() {
    this.loading = true;

    const tasksQuery = query(this.getTasksRef(), orderBy('status'), orderBy('order'));

    return onSnapshot(tasksQuery, (snapshot) => {
      this.tasks.length = 0;
      snapshot.forEach((task) => {
        this.tasks.push(this.mapTaskObj(task.data(), task.id));
      });
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
            console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
            console.log("Modified note: ", change.doc.data());
        }
        if (change.type === 'removed') {
          console.log('Removed note: ', change.doc.data());
        }
      });

      this.loading = false;
      window.dispatchEvent(new Event('tasks-updated'));
    });
  }

  mapTaskObj(obj: any, id: string): Task {
    return {
      id: id,
      status: obj.status || '',
      order: obj.order || 0,
      title: obj.title || '',
      description: obj.description || '',
      dueDate: obj.dueDate || null,
      priority: obj.priority || '',
      assignees: obj.assignees || [],
      category: obj.category || '',
      subtasks: obj.subtasks || [],
    };
  }

  async deleteDocument(colId: string, docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log(err);
    });
  }

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

  getCleanJson(task: Task): {} {
    return {
      status: task.status,
      order: task.order,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      assignees: task.assignees,
      category: task.category,
      subtasks: task.subtasks,
    };
  }

  async updateSubtasks(task: Task) {
    if (task.id) {
      const docRef = this.getSingleDocRef('tasks', task.id);
      await updateDoc(docRef, this.getCleanJsonSubtasks(task))
        .catch((err) => {
          console.log(err);
        })
        .then();
    }
  }

  getCleanJsonSubtasks(task: Task): {} {
    return {
      subtasks: task.subtasks
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

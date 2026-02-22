import { deleteApp, initializeApp } from 'firebase/app';
import {
  addDoc,
  collection,
  getDocs,
  getFirestore,
  Timestamp,
  terminate,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyDYOAGoYWk3bIjjbbJvzy2r45bh35c6pcs',
  authDomain: 'my-join-a5aae.firebaseapp.com',
  projectId: 'my-join-a5aae',
  storageBucket: 'my-join-a5aae.firebasestorage.app',
  messagingSenderId: '259563977844',
  appId: '1:259563977844:web:6b36e4de432db91feaa521',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tasksCollection = collection(db, 'tasks');

const statuses = ['to-do', 'in-progress', 'await-feedback', 'done'];
const nextOrderByStatus = {
  'to-do': -1,
  'in-progress': -1,
  'await-feedback': -1,
  done: -1,
};

const existingTasks = await getDocs(tasksCollection);
for (const taskDoc of existingTasks.docs) {
  const task = taskDoc.data();
  if (statuses.includes(task.status) && typeof task.order === 'number') {
    nextOrderByStatus[task.status] = Math.max(nextOrderByStatus[task.status], task.order);
  }
}

const addDays = (daysFromNow) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return Timestamp.fromDate(date);
};

const templates = [
  {
    status: 'to-do',
    title: 'Onboarding-Flow finalisieren',
    description: 'Texte und Validierung fuer den Einstieg neuer Nutzer ueberarbeiten.',
    dueInDays: 2,
    priority: 'high',
    assignees: ['Max Mustermann', 'Erika Musterfrau'],
    category: 'user-story',
    subtasks: [
      { title: 'Fehlermeldungen vereinheitlichen', done: false },
      { title: 'Sign-up UX testen', done: false },
    ],
  },
  {
    status: 'to-do',
    title: 'Kontakt-Suche verbessern',
    description: 'Suche soll bei Name und E-Mail toleranter reagieren.',
    dueInDays: 4,
    priority: 'medium',
    assignees: ['Jonas Becker'],
    category: 'technical-task',
    subtasks: [
      { title: 'Suche normalisieren', done: false },
      { title: 'Leistung mit 500 Datensaetzen pruefen', done: false },
    ],
  },
  {
    status: 'to-do',
    title: 'Design-Review Board',
    description: 'Abstaende und mobile Breakpoints im Board angleichen.',
    dueInDays: 3,
    priority: 'medium',
    assignees: ['Sofia Klein'],
    category: 'user-story',
    subtasks: [
      { title: 'Spacing pruefen', done: false },
      { title: 'Mobile Header anpassen', done: false },
    ],
  },
  {
    status: 'to-do',
    title: 'Task-Filter dokumentieren',
    description: 'Kurze Entwicklerdoku fuer Suchlogik und Statusfilter erstellen.',
    dueInDays: 6,
    priority: 'low',
    assignees: ['Liam Wagner'],
    category: 'technical-task',
    subtasks: [
      { title: 'README Abschnitt ergaenzen', done: false },
      { title: 'Beispiele fuer Suchbegriffe notieren', done: false },
    ],
  },
  {
    status: 'in-progress',
    title: 'Drag-and-Drop Stabilisierung',
    description: 'Reihenfolge bei schnellem Verschieben von Tasks stabil halten.',
    dueInDays: 1,
    priority: 'high',
    assignees: ['Max Mustermann'],
    category: 'technical-task',
    subtasks: [
      { title: 'Order Updates batchen', done: true },
      { title: 'Race Conditions testen', done: false },
    ],
  },
  {
    status: 'in-progress',
    title: 'Login Fehlermeldungen',
    description: 'Fehlermeldungen fuer falsches Passwort und unbekannte E-Mail trennen.',
    dueInDays: 2,
    priority: 'medium',
    assignees: ['Erika Musterfrau'],
    category: 'user-story',
    subtasks: [
      { title: 'Fehlercodes mappen', done: true },
      { title: 'UI Texte abstimmen', done: false },
    ],
  },
  {
    status: 'in-progress',
    title: 'Kontaktkarten a11y',
    description: 'Fokusreihenfolge und ARIA-Labels fuer Kontaktkarten verbessern.',
    dueInDays: 5,
    priority: 'medium',
    assignees: ['Sofia Klein', 'Jonas Becker'],
    category: 'technical-task',
    subtasks: [
      { title: 'Keyboard Navigation pruefen', done: true },
      { title: 'Screenreader Test durchfuehren', done: false },
    ],
  },
  {
    status: 'in-progress',
    title: 'Formulare vereinheitlichen',
    description: 'Gemeinsame Input-Komponente fuer Login und Sign-up einfuehren.',
    dueInDays: 7,
    priority: 'low',
    assignees: ['Liam Wagner'],
    category: 'technical-task',
    subtasks: [
      { title: 'Component API definieren', done: true },
      { title: 'Alte Felder migrieren', done: false },
    ],
  },
  {
    status: 'await-feedback',
    title: 'Board Suchfeld UX',
    description: 'Feedback vom Team zur Sichtbarkeit und Platzierung des Suchfelds einholen.',
    dueInDays: 1,
    priority: 'medium',
    assignees: ['Erika Musterfrau', 'Sofia Klein'],
    category: 'user-story',
    subtasks: [
      { title: 'Mockup teilen', done: true },
      { title: 'Rueckmeldungen auswerten', done: false },
    ],
  },
  {
    status: 'await-feedback',
    title: 'Task Prioritaeten Farben',
    description: 'Kontrastcheck fuer High/Medium/Low Prioritaeten abnehmen lassen.',
    dueInDays: 3,
    priority: 'high',
    assignees: ['Jonas Becker'],
    category: 'technical-task',
    subtasks: [
      { title: 'WCAG Kontrast messen', done: true },
      { title: 'Alternative Farben vorschlagen', done: false },
    ],
  },
  {
    status: 'await-feedback',
    title: 'Summary KPIs abstimmen',
    description: 'Welche Kennzahlen auf der Summary-Seite gezeigt werden sollen final klaeren.',
    dueInDays: 4,
    priority: 'medium',
    assignees: ['Max Mustermann', 'Liam Wagner'],
    category: 'user-story',
    subtasks: [
      { title: 'Stakeholder Termin dokumentieren', done: true },
      { title: 'KPI Liste aktualisieren', done: false },
    ],
  },
  {
    status: 'await-feedback',
    title: 'Routing Guards pruefen',
    description: 'Absicherung fuer nicht eingeloggte User auf allen geschuetzten Routen.',
    dueInDays: 5,
    priority: 'high',
    assignees: ['Max Mustermann'],
    category: 'technical-task',
    subtasks: [
      { title: 'Guard Verhalten demoen', done: true },
      { title: 'QA Rueckmeldung einarbeiten', done: false },
    ],
  },
  {
    status: 'done',
    title: 'Projektstruktur aufgeraeumt',
    description: 'Services, Interfaces und Utilities konsistent organisiert.',
    dueInDays: -5,
    priority: 'low',
    assignees: ['Liam Wagner'],
    category: 'technical-task',
    subtasks: [
      { title: 'Verwaiste Dateien entfernt', done: true },
      { title: 'Imports sortiert', done: true },
    ],
  },
  {
    status: 'done',
    title: 'Kontakt-Erstellung eingebaut',
    description: 'Anlage neuer Kontakte inklusive Farblogik implementiert.',
    dueInDays: -3,
    priority: 'medium',
    assignees: ['Erika Musterfrau'],
    category: 'user-story',
    subtasks: [
      { title: 'Form validiert', done: true },
      { title: 'Firestore Write getestet', done: true },
    ],
  },
  {
    status: 'done',
    title: 'Auth Basisfunktionen fertig',
    description: 'Login, Guest Login und Logout End-to-End getestet.',
    dueInDays: -1,
    priority: 'high',
    assignees: ['Jonas Becker', 'Sofia Klein'],
    category: 'technical-task',
    subtasks: [
      { title: 'Auth Errors abgefangen', done: true },
      { title: 'Session Flow validiert', done: true },
    ],
  },
];

for (const task of templates) {
  nextOrderByStatus[task.status] += 1;
  const order = nextOrderByStatus[task.status];

  const payload = {
    status: task.status,
    order,
    title: task.title,
    description: task.description,
    dueDate: addDays(task.dueInDays),
    priority: task.priority,
    assignees: task.assignees,
    category: task.category,
    subtasks: task.subtasks,
  };

  const ref = await addDoc(tasksCollection, payload);
  console.log(`Created task ${task.status} #${order}: ${ref.id} (${task.title})`);
}

console.log('Done');
await terminate(db);
await deleteApp(app);

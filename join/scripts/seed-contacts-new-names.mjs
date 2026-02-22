import { deleteApp, initializeApp } from 'firebase/app';
import { loadFirebaseConfig } from './load-firebase-config.mjs';
import { addDoc, collection, getFirestore, terminate } from 'firebase/firestore';

const firebaseConfig = await loadFirebaseConfig();

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const suffix = Date.now();
const contacts = [
  {
    name: 'Anna Schulz',
    email: `anna.schulz+${suffix}@example.com`,
    phone: '+49 152 10101010',
    isAvailable: true,
    userColor: '#FF7A00',
  },
  {
    name: 'Mehmet Yilmaz',
    email: `mehmet.yilmaz+${suffix}@example.com`,
    phone: '+49 152 20202020',
    isAvailable: true,
    userColor: '#00B894',
  },
  {
    name: 'Clara Neumann',
    email: `clara.neumann+${suffix}@example.com`,
    phone: '+49 152 30303030',
    isAvailable: true,
    userColor: '#0984E3',
  },
  {
    name: 'David Koenig',
    email: `david.koenig+${suffix}@example.com`,
    phone: '+49 152 40404040',
    isAvailable: true,
    userColor: '#E84393',
  },
  {
    name: 'Fatima Rahimi',
    email: `fatima.rahimi+${suffix}@example.com`,
    phone: '+49 152 50505050',
    isAvailable: true,
    userColor: '#6C5CE7',
  },
];

for (const contact of contacts) {
  const ref = await addDoc(collection(db, 'contacts'), contact);
  console.log(`Created contact ${contact.name}: ${ref.id}`);
}

console.log('Done');
await terminate(db);
await deleteApp(app);

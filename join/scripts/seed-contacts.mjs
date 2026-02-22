import { deleteApp, initializeApp } from 'firebase/app';
import { addDoc, collection, getFirestore, terminate } from 'firebase/firestore';

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

const suffix = Date.now();
const contacts = [
  {
    name: 'Max Mustermann',
    email: `max.mustermann+${suffix}@example.com`,
    phone: '+49 151 11111111',
    isAvailable: true,
    userColor: '#29ABE2',
  },
  {
    name: 'Erika Musterfrau',
    email: `erika.musterfrau+${suffix}@example.com`,
    phone: '+49 151 22222222',
    isAvailable: true,
    userColor: '#FC71FF',
  },
  {
    name: 'Jonas Becker',
    email: `jonas.becker+${suffix}@example.com`,
    phone: '+49 151 33333333',
    isAvailable: true,
    userColor: '#FFBB2B',
  },
  {
    name: 'Sofia Klein',
    email: `sofia.klein+${suffix}@example.com`,
    phone: '+49 151 44444444',
    isAvailable: true,
    userColor: '#6E52FF',
  },
  {
    name: 'Liam Wagner',
    email: `liam.wagner+${suffix}@example.com`,
    phone: '+49 151 55555555',
    isAvailable: true,
    userColor: '#1FD7C1',
  },
];

for (const contact of contacts) {
  const ref = await addDoc(collection(db, 'contacts'), contact);
  console.log(`Created contact ${contact.name}: ${ref.id}`);
}

console.log('Done');
await terminate(db);
await deleteApp(app);

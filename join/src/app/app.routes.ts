import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { Imprint } from './imprint/imprint';
import { Privacy } from './privacy/privacy';
import { HelpPage } from './help-page/help-page';
import { Contacts } from './main-page/contacts/contacts';
import { AddTask } from './main-page/add-task/add-task';
import { Board } from './main-page/board/board';
import { Summary } from './main-page/summary/summary';

export const routes: Routes = [
  { path: 'login', component: MainPage },
  { path: 'summary', component: Summary },
  { path: 'add-task', component: AddTask },
  { path: 'board', component: Board },
  { path: 'contacts', component: Contacts },
  { path: 'imprint', component: Imprint },
  { path: 'privacy', component: Privacy },
  { path: 'help', component: HelpPage },
];

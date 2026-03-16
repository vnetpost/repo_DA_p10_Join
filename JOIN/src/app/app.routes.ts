import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { Imprint } from './imprint/imprint';
import { Privacy } from './privacy/privacy';
import { HelpPage } from './help-page/help-page';
import { ContactsPage } from './main-page/contacts/contacts-page';
import { AddTask } from './main-page/add-task/add-task';
import { TasksBoard } from './main-page/board/tasks-board';
import { Summary } from './main-page/summary/summary';
import { authGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: MainPage },
  { path: 'summary', component: Summary, canActivate: [authGuard] },
  { path: 'add-task', component: AddTask, canActivate: [authGuard] },
  { path: 'board', component: TasksBoard, canActivate: [authGuard] },
  { path: 'contacts', component: ContactsPage, canActivate: [authGuard] },
  { path: 'imprint', component: Imprint },
  { path: 'privacy', component: Privacy },
  { path: 'help', component: HelpPage },
];

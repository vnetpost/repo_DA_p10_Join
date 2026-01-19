import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { Imprint } from './imprint/imprint';
import { Privacy } from './privacy/privacy';
import { HelpPage } from './help-page/help-page';

export const routes: Routes = [
  { path: '', component: MainPage },
  { path: 'imprint', component: Imprint },
  { path: 'privacy', component: Privacy },
  { path: 'help', component: HelpPage },
];

import { Routes } from '@angular/router';
import { ConfigGeneratorComponent } from './components/config-generator/config-generator.component';
import { HistoryComponent } from './components/history/history.component';

export const routes: Routes = [
  { path: '', redirectTo: '/generator', pathMatch: 'full' },
  { path: 'generator', component: ConfigGeneratorComponent },
  { path: 'history', component: HistoryComponent },
  { path: '**', redirectTo: '/generator' }
]; 
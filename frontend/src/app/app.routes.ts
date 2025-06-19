import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'forms/form1', loadComponent: () => import('./components/forms/form1/form1.component').then(m => m.Form1Component) },
  { path: 'forms/form2', loadComponent: () => import('./components/forms/form2/form2.component').then(m => m.Form2Component) },
  { path: 'forms/form3', loadComponent: () => import('./components/forms/form3/form3.component').then(m => m.Form3Component) },
  { path: 'forms/form4', loadComponent: () => import('./components/forms/form4/form4.component').then(m => m.Form4Component) },
  { path: 'forms/form5', loadComponent: () => import('./components/forms/form5/form5.component').then(m => m.Form5Component) },
  { path: 'forms/form6', loadComponent: () => import('./components/forms/form6/form6.component').then(m => m.Form6Component) },
  { path: 'forms/form7', loadComponent: () => import('./components/forms/form7/form7.component').then(m => m.Form7Component) },
  { path: 'forms/form8', loadComponent: () => import('./components/forms/form8/form8.component').then(m => m.Form8Component) },
  { path: 'forms/form9', loadComponent: () => import('./components/forms/form9/form9.component').then(m => m.Form9Component) },
  { path: 'forms/form10', loadComponent: () => import('./components/forms/form10/form10.component').then(m => m.Form10Component) },
  { path: '**', redirectTo: '' }
]; 
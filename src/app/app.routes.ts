import { Routes } from '@angular/router';
import { Forum } from './forum/forum';
import { PostDetailComponent } from './forum/post-detail/post-detail';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./home/home').then(m => m.Home)
  },

  {
    path: 'forum',
    component: Forum,
    children: [
      {
        path: 'post/:id',
        component: PostDetailComponent
      }
    ]
  },

  {
    path: 'interview',
    loadComponent: () =>
      import('./interv-question/interv-question').then(m => m.IntervQuestion)
  },

  {
    path: 'aiBot',
    loadComponent: () =>
      import('./learn-with-ai/learn-with-ai').then(m => m.LearnWithAi)
  },

  {
    path: 'roadmap',
    loadComponent: () =>
      import('./road-map/road-map').then(m => m.RoadMap)
  },

  {
    path: 'backend',
    loadComponent: () =>
      import('./pages/backend/backend').then(m => m.Backend)
  },

];

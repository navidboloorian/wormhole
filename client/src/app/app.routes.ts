import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { RoomComponent } from './room/room.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Wormhole',
  },
  {
    path: 'room',
    component: RoomComponent,
    title: 'Wormhole',
  },
];

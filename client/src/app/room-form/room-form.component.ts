import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../room.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'wh-room-form',
  standalone: true,
  imports: [FormsModule, SnackbarComponent],
  templateUrl: './room-form.component.html',
  styleUrl: './room-form.component.scss',
})
export class RoomFormComponent {
  roomCode = signal('');
  snackbarMessage = signal('');
  snackbarType: 'error' | 'success';

  constructor(private _roomService: RoomService, private _router: Router) {}

  // only permit alphanumerics, hyphens, and underscores
  public preventChars(event: KeyboardEvent) {
    return /^[a-zA-Z0-9_-]*$/.test(event.key);
  }

  public async createRoom() {
    const resp = await this._roomService.createRoom(this.roomCode());

    if (resp.success) {
      this.snackbarType = 'success';
      this.snackbarMessage.set('Room created! Redirecting...');
      this._router.navigate([`/room/${this.roomCode()}`]);
    } else if (resp.error) {
      this.snackbarType = 'error';
      this.snackbarMessage.set(resp.error[0]);
    }
  }

  public async getRoom() {
    const resp = await this._roomService.getRoom(this.roomCode());

    if (resp.success) {
      this.snackbarType = 'success';
      this.snackbarMessage.set('Room found! Redirecting...');
      this._router.navigate([`/room/${this.roomCode()}`]);
    } else if (resp.error) {
      this.snackbarType = 'error';
      this.snackbarMessage.set(resp.error[0]);
    }
  }
}

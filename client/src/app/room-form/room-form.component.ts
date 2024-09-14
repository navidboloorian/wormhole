import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoomService } from '../room.service';
import { SnackbarComponent } from '../snackbar/snackbar.component';

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

  constructor(private _roomService: RoomService) {}

  public async createRoom() {
    const resp = await this._roomService.createRoom(this.roomCode());

    if (resp.success) {
      this.snackbarType = 'success';
      this.snackbarMessage.set('Room created! Redirecting...');
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
    } else if (resp.error) {
      this.snackbarType = 'error';
      this.snackbarMessage.set(resp.error[0]);
    }
  }
}

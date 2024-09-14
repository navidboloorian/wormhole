import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { lastValueFrom } from 'rxjs';

type Response = {
  success?: { id: string } | boolean;
  error?: string[];
};

@Injectable({
  providedIn: 'root',
})
export class RoomService {
  constructor(private http: HttpClient) {}

  public async createRoom(roomCode: string): Promise<Response> {
    const resp = this.http.post(`http://${environment.apiUrl}/room`, {
      id: roomCode,
    });

    return await lastValueFrom<Response>(resp);
  }

  public async getRoom(roomCode: string): Promise<Response> {
    const resp = this.http.get(`http://${environment.apiUrl}/room/${roomCode}`);

    return await lastValueFrom<Response>(resp);
  }
}

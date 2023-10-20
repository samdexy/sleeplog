import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import axios from 'axios';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public fetchURL = 'http://localhost:8888/oauth/token';
  constructor(
    private userService: UserService,
  ) {}

  public async getToken<T>(): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.fetchURL}`
      });
      return res.data;
    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }

  public async refresh_token(): Promise<boolean> {
    let formData = new FormData();

    const data = {
      grant_type: "refresh_token",
      refresh_token: localStorage.getItem("refresh_token"),
      client_id: "33a7b468-55ea-4e65-99c5-09bc8ea061e9",
      client_secret: "root",
    };
    for (let key in data) {
      formData.append(key, data[key]);
    }
    let refresh = this.userService.new_access_token(formData).then(res => {

      let access_token = res.data["access_token"]
      let refresh_token = res.data["refresh_token"]

      localStorage.setItem("access_token", "Bearer " + access_token);
      localStorage.setItem("refresh_token", refresh_token);

      return true
    });
    return refresh
  }
}

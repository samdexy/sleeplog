import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import axios from 'axios';



@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private fetchURL = 'http://localhost:8888/jsonapi/profile/user';
  private postURL = 'http://localhost:8888/entity/profile?_format=json';

  constructor() {}
  
  public async postProfile<T>(body: Object, token:string): Promise<T> {
    try {
      console.log(token)
      console.log(body)


        const res = await axios.request<T>({
        method: 'post',
        url: this.postURL,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token

      },
        data: body
      });
      return res.data;
    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }
  
  public async getProfiles<T>(): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: this.fetchURL
      });
      return res.data;
    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  public async getProfile<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.fetchURL}/${id}?include=field_profile_picture`
      });
      return res.data;
    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  public async getProfileImg<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.fetchURL}/${id}/field_profile_picture`
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
}


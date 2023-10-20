import { Injectable } from "@angular/core";
import axios from "axios";
import { AxiosInstance } from "axios";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class PostService {
  getPostsURL = 'http://localhost:8888/jsonapi/node/posts';
  
  constructor() {

  }


  public async getPosts<T>(): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.getPostsURL}`
      });
      return res.data;

    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  public async getPost<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.getPostsURL}/${id}`
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

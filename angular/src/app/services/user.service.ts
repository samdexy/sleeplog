import { Injectable } from "@angular/core";
import axios from "axios";
import { AxiosInstance } from "axios";
import { Observable, of } from 'rxjs';
import { HttpHeaders } from "@angular/common/http";


@Injectable({
  providedIn: "root"
})
export class UserService {
  
  tokenApiURL = `http://localhost:8888/oauth/token`;
  userApiURL = `http://localhost:8888/entity/user?_format=json`;
  fetchUserURL = 'http://localhost:8888/jsonapi/user/user';

  private axiosClient: AxiosInstance;
  constructor() {
    this.axiosClient = axios.create();
  }


  public async getUser<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.fetchUserURL}/${id}`
      });
      return res.data;
    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  public async postUser<T>(body: Object): Promise<T> {
    try {
        const axiosResponse = await axios.request<T>({
            method: 'post',
            url: `${this.userApiURL}`,
            headers: {'Content-Type': 'application/json'},
            data: body
           
        });
        return( axiosResponse.data );
    } catch (e) {
      return e.response["data"]["message"];
    }
  }

  login(data) {
    return this.axiosClient.post(this.tokenApiURL, data);
  }

  new_access_token(data) {
    return this.axiosClient.post(this.tokenApiURL, data);
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}

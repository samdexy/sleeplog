import { Injectable } from "@angular/core";
import axios from "axios";
import { AxiosInstance } from "axios";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class EntryService {
  getEntriesURL = 'http://localhost:8888/jsonapi/node/entries';
  
  constructor() {

  }


  public async getEntries<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.getEntriesURL}?filter[field_profile.id]=${id}`
      });
      return res.data;

    } catch (error) {
      return Promise.reject(this.handleError(error));
    }
  }

  public async getEntry<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.getEntriesURL}/${id}`
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

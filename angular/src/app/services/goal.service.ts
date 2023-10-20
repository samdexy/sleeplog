import { Injectable } from "@angular/core";
import axios from "axios";
import { AxiosInstance } from "axios";
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: "root"
})
export class GoalService {
  getGoalURL = 'http://localhost:8888/jsonapi/node/goals';

  constructor() {
  }


  public async getGoals<T>(id: string): Promise<T> {
    try {
      const res = await axios.request<T>({
        method: 'get',
        url: `${this.getGoalURL}?filter[revision_uid.id]=${id}&filter[status]=1`
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

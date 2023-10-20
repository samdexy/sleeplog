import { Injectable } from "@angular/core";
import { Subject, Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class LocalstorageService {
  constructor() {}

  private storageSub = new Subject<Boolean>();

  watchStorage(): Observable<any> {
    return this.storageSub.asObservable();
  }

  setItemBearer(key: string, data: any) {
    localStorage.setItem(key, `Bearer ${data}`);
    this.storageSub.next(true);
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
    this.storageSub.next(false);
  }
}

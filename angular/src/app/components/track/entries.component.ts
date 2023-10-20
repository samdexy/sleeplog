import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Profile } from '../../models/profile';
import { User } from '../../models/user';
import { Entry } from '../../models/entry';
import { UserService } from '../../services/user.service';
import { EntryService } from "../../services/entry.service";
import { JsonObject } from '../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileImg, ImgAttributes } from '../../models/profile_picture';
import { LocalstorageService } from "../../services/localstorage.service";
import { HttpParams, HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common'

@Component({
  selector: 'app-entries',
  templateUrl: './entries.component.html',
  styleUrls: ['./entries.component.scss'],
  encapsulation: ViewEncapsulation.None


})
export class EntryComponent implements OnInit {
  public profile: Profile;
  public user: User[];
  public entries: Entry[];
  public profile_picture: ProfileImg[];


  id = localStorage.getItem("uuid");
  profile_id: string;
  datepipe: DatePipe = new DatePipe('en-US');
  bool: Boolean;


  @ViewChild('navTemplate', { read: TemplateRef }) navTemplate: TemplateRef<any>;
  @ViewChild('statsTemplate', { read: TemplateRef }) statsTemplate: TemplateRef<any>;

  constructor(
    private userService: UserService,
    private entryService: EntryService,
    private router: Router,
    private http: HttpClient


  ) { }

  ngOnInit() {

    if (localStorage.access_token) {
      console.log(this.id)

      this.bool = true;

      this.getUser();
      this.getProfile();

    }
    else {
      this.router.navigate(["login"]);
    }
  }


  refreshPage(): void {
    window.location.reload();
  }

  public async getUser(): Promise<void> {
    try {
      const res = await this.userService.getUser<JsonObject>(this.id);
      this.user = res.data;
      console.log(this.user);
    } catch (error) {
      console.error(error);
    }
  }

  public async getEntries(): Promise<void> {
    try {
      const res = await this.entryService.getEntries<JsonObject>(this.profile_id);
      this.entries = res.data;

      for (let i = 0; i < res.data.length; i++) {
        let dateEntry = new Date(res.data[i]['attributes']['field_created']);
        let dateToday = new Date();

        let dateFormatEntry = this.datepipe.transform(dateEntry, 'yyyy-MM-dd');
        let dateFormatToday = this.datepipe.transform(dateToday, 'yyyy-MM-dd');


        if (dateFormatEntry == dateFormatToday) {
          this.bool = false;
        }

      }

      console.log(this.profile_id);
    } catch (error) {
      console.error(error);
    }
  }

  public async deleteEntry(id: number) {

    try {

      const httpOptionsPatch = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("access_token")
        })
      };

      this.http.delete(`http://localhost:8888/node/${id}?_format=json`, httpOptionsPatch)
        .subscribe(event => {
          console.log(event);
          this.refresh_token();
          this.refreshPage();
        })

    } catch (error) {
      console.error(error);
    }

  }


  public async getProfile(): Promise<void> {

    let params = new HttpParams();
    params = params.append('filter[uid.id]', this.id);

    try {

      await this.http.get<JsonObject>('http://localhost:8888/jsonapi/profile/user', { params: params })
        .subscribe(event => {
          this.profile = event.data;
          this.profile_id = event.data[0]["id"]
          this.getEntries();

        });



    } catch (error) {
      console.error(error);
    }
  }

  private refresh_token(): Promise<boolean> {
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

import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Profile, Attributes } from '../../../models/profile';
import { User } from '../../../models/user';
import { DatePipe } from '@angular/common'
import { ProfileService } from './../../../services/profile.service';
import { AuthService } from './../../../services/auth.service';
import { UserService } from "../../../services/user.service";
import { GoalService } from "../../../services/goal.service";
import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { RatingChangeEvent } from 'angular-star-rating';


@Component({
  selector: 'app-entry-create',
  templateUrl: './entry-create.component.html',
  styleUrls: ['./entry-create.component.scss'],


})
export class EntryCreateComponent implements OnInit {
  public profile: Profile[];
  public user: User[];
  datepipe: DatePipe = new DatePipe('en-US');

  onRatingChangeResult: RatingChangeEvent;


  fileName: string = '';
  msg: string = '';
  uid: number;
  profile_id: number;
  profile_uid: string;
  isActive: boolean;

  scoreQuality: number;
  scoreRested: number;

  id = this.route.snapshot.paramMap.get('id');
  userDate;
  token;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient

  ) {

  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getUser();
    this.getProfile();

  }

  changeMsg(string): void {
    this.msg = string;
  }


  public async getUser(): Promise<void> {
    try {
      const res = await this.userService.getUser<JsonObject>(this.id);
      this.uid = res.data["id"]

    } catch (error) {
      console.error(error);
    }
  }

  public async getProfile(): Promise<void> {

    let params = new HttpParams();
    params = params.append('filter[uid.id]', localStorage.getItem("uuid"));

    try {

      await this.http.get<JsonObject>('http://localhost:8888/jsonapi/profile/user', { params: params })
        .subscribe(event => {

          this.profile_id = event.data[0]["attributes"]["drupal_internal__profile_id"];
          this.profile_uid = event.data[0]["id"]

        });



    } catch (error) {
      console.error(error);
    }
  }

  onRatingChangeQuality = ($event: RatingChangeEvent) => {
    this.onRatingChangeResult = $event;
    this.scoreQuality = this.onRatingChangeResult.rating
  };

  onRatingChangeRested = ($event: RatingChangeEvent) => {
    this.onRatingChangeResult = $event;
    this.scoreRested = this.onRatingChangeResult.rating
  };

  public async createEntry(bedTime, riseTime, noteStr) {

    let timestamp = new Date();
    let bed = bedTime.value
    let rise = riseTime.value
    let note = noteStr.value
    let dateFormat = this.datepipe.transform(timestamp, 'yyyy-MM-dd');


    try {
      if (bed != null && rise != null && this.scoreQuality != null && this.scoreRested != null) {

        const httpOptionsPatch = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("access_token")
          })
        };
        let body: any =
        {
          type: "entries",
          title: [{ value: "Entry " + timestamp.toLocaleString() }],
          field_profile: [
            {
              target_id: this.profile_id,
              target_type: "profile",
              target_uuid: this.profile_uid,
              url: "/profile/" + this.profile_id
            }
          ],
          field_bedtime: [{ value: bed }],
          field_risen: [{ value: rise }],
          field_note: [{ value: note }],

          field_quality: [{ value: this.scoreQuality }],
          field_rested: [{ value: this.scoreRested }],

          field_created: [{ value: dateFormat }],

        }


        this.http.post(`http://localhost:8888/node?_format=json`, body, httpOptionsPatch)
          .subscribe(event => {
            console.log(event);
            this.refresh_token();
            this.router.navigate(["track"]);
          })

      }

      else {
        this.changeMsg("Vul de verplichte velden in!")
      }

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

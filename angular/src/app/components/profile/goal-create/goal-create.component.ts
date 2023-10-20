import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Profile, Attributes } from '../../../models/profile';
import { User } from '../../../models/user';
import { UserService } from "../../../services/user.service";
import { GoalService } from "../../../services/goal.service";

import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-goal-create',
  templateUrl: './goal-create.component.html',
  styleUrls: ['./goal-create.component.scss'],


})
export class GoalCreateComponent implements OnInit {
  public profile: Profile[];
  public user: User[];

  fileName: string = '';
  msg: string = '';
  uid: number;
  profile_id: number;
  profile_uid: string;
  isActive: boolean;

  id = this.route.snapshot.paramMap.get('id');
  userDate;
  token;

  constructor(
    private userService: UserService,
    private authService: UserService,

    private goalService: GoalService,
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
    params = params.append('filter[uid.id]', this.id);

    try {

      await this.http.get<JsonObject>('http://localhost:8888/jsonapi/profile/user', { params: params })
        .subscribe(event => {

          this.profile_id = event.data[0]["attributes"]["drupal_internal__profile_id"];
          this.profile_uid = event.data[0]["id"]

          console.log(this.profile_uid, this.profile_id)
        });



    } catch (error) {
      console.error(error);
    }
  }

  public async checkGoal(): Promise<void> {
    const res = await this.goalService.getGoals<JsonObject>(this.id);
    this.isActive = res.data[0]["attributes"]["status"]

    if (this.isActive == true) {
      this.router.navigate(["profile"]);
    }
  }

  public async createGoal(date, average) {

    let dt = date.value
    let nAverage = average.value

    console.log(localStorage.getItem("access_token"))

    try {
      if (dt != null && nAverage != null) {
        const httpOptionsPatch = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("access_token")
          })
        };
        let body: any =
        {
          type: "goals",
          status: [{ value: 1 }],
          title: [{ value: "Goal " + String(dt) }],
          field_profile_id: [
            {
              target_id: this.profile_id,
              target_type: "profile",
              target_uuid: this.profile_uid,
              url: "/profile/" + this.profile_id
            }
          ],
          field_goal: [{ value: dt }],
          field_achieved: [{ value: 0 }],
          field_average: [{ value: Math.round(nAverage * 10) / 10 }],

        }


        this.http.post(`http://localhost:8888/node?_format=json`, body, httpOptionsPatch)
          .subscribe(event => {
            console.log(event);
            this.refresh_token();
            this.router.navigate(["profile"]);
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

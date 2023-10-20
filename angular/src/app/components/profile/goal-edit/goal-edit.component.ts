import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Profile } from '../../../models/profile';
import { User } from '../../../models/user';
import { Goal } from '../../../models/goal';
import { UserService } from "../../../services/user.service";
import { GoalService } from "../../../services/goal.service";

import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-goal-edit',
  templateUrl: './goal-edit.component.html',
  styleUrls: ['./goal-edit.component.scss'],


})
export class GoalEditComponent implements OnInit {
  public profile: Profile[];
  public user: User[];
  public goal: Goal[];


  fileName: string = '';
  msg: string = '';
  uid: number;
  goal_id: number;
  isActive: boolean;
  id = this.route.snapshot.paramMap.get('id');
  token;


  constructor(

    private userService: UserService,
    private goalService: GoalService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient

  ) {

  }

  ngOnInit() {

    this.id = this.route.snapshot.paramMap.get('id');
    this.getUser();
    this.getGoal();
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


  parseDate(dateString: string): Date {
    if (dateString) {
      return new Date(dateString);
    } else {
      return null;
    }
  }

  public async getGoal(): Promise<void> {
    const res = await this.goalService.getGoals<JsonObject>(this.id);

    this.isActive = res.data[0]["attributes"]["status"];
    this.goal = res.data[0];
    this.goal_id = res.data[0]["attributes"]["drupal_internal__nid"]


    if (this.isActive == false) {
      this.router.navigate(["profile"]);
    }

  }


  public async patchGoal(date, average) {

    let dt = date.value
    let nAverage = average.value

    try {


      if (nAverage > 5) {

        const httpOptionsPatch = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("access_token")
          })
        };
        let body: any =
        {
          type: "goals",
          field_goal: [
            {
              value: dt
            }
          ],
          field_average: [
            {
              value: Math.round(nAverage * 10) / 10
            }
          ],

        }


        this.http.patch(`http://localhost:8888/node/${this.goal_id}?_format=json`, body, httpOptionsPatch)
          .subscribe(event => {
            console.log(event);
            this.refresh_token();
            this.router.navigate(["profile"]);
          })

      }

      else {
        this.changeMsg("De gemiddelde uren slaap mogen niet lager zijn dan 5 uur.")
      }

    } catch (error) {
      console.error("error");
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

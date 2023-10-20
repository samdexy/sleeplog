import { Component, OnInit, Input } from "@angular/core";

import { UserService } from "../../services/user.service";
import { ProfileService } from "../../services/profile.service";

import { Observable, of } from 'rxjs';
import { JsonObject } from "src/app/models/json";
import { ActivatedRoute, Router } from '@angular/router';
import { User, UserAttributes } from './../../models/user';

import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';
import { errorHandler } from "@angular/platform-browser/src/browser";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  username: string;
  email: string;
  password: string;
  birthday: string;
  location: string;
  school: string;
  tagline: string;
  response: any;

  msg: string = '';
  id = this.route.snapshot.paramMap.get('id');
  user: User;


  constructor(
    private userService: UserService,
    private profileService: ProfileService,

    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient

  ) { }

  ngOnInit() {
    if (localStorage.access_token) {
      this.router.navigate(["profile"]);
    }
  }

  changeMsg(string): void {
    this.msg = string;
  }

  public async register(): Promise<void> {
    try {


      const postObject = {
        name: [
          {
            value: this.username
          }
        ],
        mail: [
          {
            value: this.email
          }
        ],
        pass: [
          {
            value: this.password
          }
        ],
        status: [
          {
            value: 1
          }
        ],
        roles: [
          {
            target_id: "user",
            target_type: "user_role",
            target_uuid: "c8471d28-69b3-494a-b476-47ca5b8005f0"
          }
        ]
      }

      const jsonResponse = await this.userService.postUser<JsonObject>(postObject).then(res => {
        if (res) {
          this.login(this.username, this.password)
        }
        this.response = res;
      })

      console.log(jsonResponse);


    } catch (error) {



      console.error(error);
    }

  }

  login(logName: string, logPass: string) {

    let formData = new FormData();
    let user_id;
    let user_uid;

    const data = {
      username: logName,
      password: logPass,
      client_id: "33a7b468-55ea-4e65-99c5-09bc8ea061e9",
      client_secret: "root",
      grant_type: "password",
      scope: "user"
    };

    for (let key in data) {
      formData.append(key, data[key]);
    }

    this.userService.login(formData).then(res => {

      let params = new HttpParams();
      params = params.append('filter[name]', this.username);

      this.http.get<JsonObject>('http://localhost:8888/jsonapi/user/user', { params: params })
        .subscribe(event => {

          user_id = event.data[0]["id"]
          user_uid = event.data[0]["attributes"]["drupal_internal__uid"]

          localStorage.setItem("uuid", user_id);
          localStorage.setItem("access_token", "Bearer " + res.data.access_token);
          localStorage.setItem("refresh_token", res.data.refresh_token);

          this.createProfile(user_id, user_uid, "Bearer " + res.data.access_token)

        });

    }


    ).catch((err) => {
      this.changeMsg(this.response)
      console.error(err);

    }
    );
  }

  createProfile(id: string, uid: number, token) {


    const postObject = {
      type: "user",
      uid: [
        {
          target_id: uid,
          target_type: "user",
          target_uuid: id,
          url: "/user/" + id.toString()
        }
      ],
      field_birthday: [
        {
          value: this.birthday
        },
      ],
      field_location: [
        {
          value: this.location
        },
      ],
      field_school: [
        {
          value: this.school
        },
      ],
      field_tagline: [
        {
          value: this.tagline
        },
      ]
    }

    this.profileService.postProfile(postObject, token).then(res => {
      if (res) {
        this.refresh_token()
        this.router.navigate(["profile"]);
      }
    }).catch((err) => {
      console.error(err);

    }
    );
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

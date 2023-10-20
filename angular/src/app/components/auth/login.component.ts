import { Component, OnInit, Input } from "@angular/core";

import { UserService } from "../../services/user.service";
import { JsonObject } from "src/app/models/json";
import { ActivatedRoute, Router } from '@angular/router';

import { HttpParams, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  username: string;
  password: string;
  msg: string = '';
  id = this.route.snapshot.paramMap.get('id');


  constructor(
    private userService: UserService,
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

  login() {

    let formData = new FormData();
    let user_uuid: string;

    const data = {
      username: this.username,
      password: this.password,
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

          user_uuid = event.data[0]["id"]
          console.log(user_uuid)
          this.router.navigate(["profile"]);
          localStorage.setItem("uuid", user_uuid);


        });

      localStorage.setItem("access_token", "Bearer " + res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);

    }


    ).catch((err) => {
      console.error(err);
      this.changeMsg("Verkeerde logingegevens!")
    }
    );


  }



}

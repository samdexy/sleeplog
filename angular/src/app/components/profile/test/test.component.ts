import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Profile, Attributes } from '../../../models/profile';
import { User } from '../../../models/user';
import { ProfileService } from './../../../services/profile.service';
import { AuthService } from './../../../services/auth.service';
import { UserService } from "../../../services/user.service";
import { GoalService } from "../../../services/goal.service";
import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';


@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss'],


})
export class TestComponent implements OnInit {
  public profile: Profile[];
  public user: User[];


  fileName: string = '';
  msg: string = '';
  profile_id: number;

  result: string = '';
  resultNote: string = '';

  value: number;
  option: number;

  isActive: boolean;

  list: Array<number> = new Array<number>();
  step;
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

    this.step = 1;
    this.getProfile();
  }

  changeMsg(string): void {
    this.msg = string;
  }

  next() {
    if (this.value != null) {
      this.changeMsg("")
      this.step++
      this.list.push(this.value)


      if (this.step == 7) {
        this.calcResult();
        this.noteResult();

        console.log(this.result)
      }
    }
    else {
      this.changeMsg("Kies een optie!")

    }


  }


  public async getProfile(): Promise<void> {

    let params = new HttpParams();
    params = params.append('filter[uid.id]', this.id);

    try {

      await this.http.get<JsonObject>('http://localhost:8888/jsonapi/profile/user', { params: params })
        .subscribe(event => {

          this.profile_id = event.data[0]["attributes"]["drupal_internal__profile_id"];
          this.profile = event.data[0];

        });

    } catch (error) {
      console.error(error);
    }
  }

  noteResult() {
    switch (this.result) {
      case "Screen addict": {
        this.resultNote = "&apos; s avonds uren gamen, netflixen of instagrammen? Dat ben jij! Doordat je ’s avonds niet weg te slaan bent van de schermen, verlies je soms kostbare uren slaap."
        break;
      }
      case "Panda": {
        this.resultNote = "Geeuw… GEEEUWWW…. Geeuw… Moe in de klas? Moe in de zetel? Klinkt herkenbaar voor panda’s. Wat extra slaap kan je deugd doen!"
        break;
      }
      case "Morning person": {
        this.resultNote = "Jij bent een echt ochtendmens! ’s ochtends sta je steeds lekker fris op en zou je de wereld kunnen verslaan!"
        break;
      }
      case "Restless bat": {
        this.resultNote = "Jij zou wel willen goed slapen, maar soms lukt het je echt niet… Je ligt nog lang wakker, te piekeren of te woelen."
        break;
      }
      case "Sleepyhead": {
        this.resultNote = "Ochtenden zijn zo je ding niet… Magische truc om ochtenden draaglijker te maken? Vroeger in bed kruipen!"
        break;
      }
      case "Sleep lover": {
        this.resultNote = "Slapen is voor jouw het ultieme moment om te genieten. Sleep all day? Yes please!"
        break;
      }
      default: {
        this.resultNote = "Hé goed bezig! Jij vind slaap belangrijk en probeert dit zo goed mogelijk te doen. Keep it up!"
        break;
      }
    }
  }

  calcResult() {


    if (this.list[5] == 1 || this.list[5] == 2 || this.list[5] == 3) {
      this.result = "Screen addict"

    }


    else if (this.list[4] == 1) {
      this.result = "Panda"
    }


    else if (this.list[3] == 2) {
      this.result = "Morning person"

    }


    else if (this.list[2] == 1) {
      this.result = "Restless bat"

    }

    else if (this.list[0] == 3 || this.list[1] == 1 || this.list[3] == 1) {
      this.result = "Sleepyhead"

    }

    else if (this.list[0] == 1) {
      this.result = "Sleep lover"

    }


    else {
      this.result = "King/Queen of sleep"
    }

  }



  previous() {
    this.step = this.step - 1;
    this.list.splice(-1, 1);

    console.log(this.step)
  }



  public patchData() {

    console.log(this.id)

    try {

      const httpOptionsPatch = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("access_token")
        })
      };
      let body: any =
      {
        type: "user",
        field_slaap_type: [
          {
            value: this.result
          }
        ]

      }


      this.http.patch(`http://localhost:8888/profile/${this.profile_id}?_format=json`, body, httpOptionsPatch)
        .subscribe(event => {
          console.log(event);
          this.refresh_token();
          this.router.navigate(["profile"]);
        })




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

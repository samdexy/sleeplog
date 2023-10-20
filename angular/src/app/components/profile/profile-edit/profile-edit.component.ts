import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Profile, Attributes } from '../../../models/profile';
import { User } from '../../../models/user';

import { ProfileImg, ImgAttributes } from '../../../models/profile_picture';
import { GenericFile } from '../../../models/file';

import { ProfileService } from './../../../services/profile.service';
import { AuthService } from './../../../services/auth.service';
import { UserService } from "../../../services/user.service";

import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpParams, HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-profile-edit',
  templateUrl: './profile-edit.component.html',
  styleUrls: ['./profile-edit.component.scss'],


})
export class ProfileEditComponent implements OnInit {
  public profile: Profile[];
  public user: User[];

  public profile_picture: ProfileImg[];
  public newProfile_picture: ProfileImg;

  public newProfile: Profile;
  public newFile: GenericFile;

  fileName: string = '';
  msg: string = '';
  uid: string = '';
  profile_id: number;
  id = this.route.snapshot.paramMap.get('id');
  selectedFile: File;
  userDate;
  token;

  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,

  ) {

  }

  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.getId();
    this.getUser();
    this.getProfile();

  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.changeName(this.selectedFile.name);
  }

  changeName(string): void {
    this.fileName = string;
  }

  changeMsg(string): void {
    this.msg = string;
  }


  public async getUser(): Promise<void> {
    try {
      const res = await this.userService.getUser<JsonObject>(this.id);
      this.user = res.data;
    } catch (error) {
      console.error(error);
    }
  }

  public async getId(): Promise<void> {
    try {
      const res = await this.userService.getUser<JsonObject>(this.id);
      this.uid = res.data["attributes"]["drupal_internal__uid"]

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
          this.profile = event.data[0];

        });



    } catch (error) {
      console.error(error);
    }
  }


  public postFile(birthday, location, school, tagline) {
    let uuid;
    try {


      const httpOptions = {
        headers: new HttpHeaders({
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `file; filename="${this.selectedFile.name}"`,
          'Authorization': localStorage.getItem("access_token")
        })
      };

      this.http.post<GenericFile>('http://localhost:8888/file/upload/profile/user/field_profile_picture?_format=json', this.selectedFile, httpOptions)
        .subscribe(event => {
          uuid = event.fid[0]["value"];

          this.refresh_token().then(response => {
            if (response) {
              this.patchProfileInfo(uuid, birthday, location, school, tagline)

            }
          })
        });


    } catch (error) {
      console.error(error);
    }


  }

  public patchUserInfo(strName) {


    const httpOptionsPatch = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("access_token")
      })
    };

    let request: any =
    {
      name: [
        {
          value: strName
        }
      ]
    }

    this.http.patch(`http://localhost:8888/user/${this.uid}?_format=json`, request, httpOptionsPatch)
      .subscribe(event => {

        console.log(event);

      });
  }

  public patchProfileInfo(rev_id, birthday, location, school, tagline) {

    let jsonObj: Object;

    const httpOptionsPatch = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': localStorage.getItem("access_token")
      })
    };

    let body: any =
    {
      type: "user",
      field_birthday: [
        {
          value: birthday
        }
      ],
      field_location: [
        {
          value: location
        }
      ],
      field_school: [
        {
          value: school
        }
      ],
      field_tagline: [
        {
          value: tagline
        }
      ]
    }

    let bodyFile: any =
    {
      type: "user",
      field_profile_picture: [
        {
          target_id: rev_id
        }
      ]
    }

    if (rev_id != null) {
      jsonObj = Object.assign(body, bodyFile);
    } else {
      jsonObj = body
    }

    this.http.patch(`http://localhost:8888/profile/${this.profile_id}?_format=json`, jsonObj, httpOptionsPatch)
      .subscribe(event => {
        console.log(event);

        this.refresh_token().then(response => {
          if (response) {
            this.router.navigate(["profile"]);
          }
        })

      });
  }



  public editProfile(name, birthday, location, school, tagline) {
    let strName = name.value
    let strDate = birthday.value
    let strLoc = location.value
    let strSchool = school.value
    let strTag = tagline.value
    try {

      if (strName != "" && strDate != "" && strLoc != "" && strSchool != "") {

        this.patchUserInfo(strName);

        if (this.selectedFile != null) {

          this.postFile(strDate, strLoc, strSchool, strTag);

        } else {

          this.patchProfileInfo(null, strDate, strLoc, strSchool, strTag);

        }

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

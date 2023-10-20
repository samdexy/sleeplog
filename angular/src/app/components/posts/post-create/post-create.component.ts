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
import { GenericFile } from '../../../models/file';


@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss'],


})
export class PostCreateComponent implements OnInit {
  public profile: Profile[];
  public user: User[];
  public newFile: GenericFile;

  datepipe: DatePipe = new DatePipe('en-US');

  onRatingChangeResult: RatingChangeEvent;

  selectedFile: File;
  fileName: string = '';
  msg: string = '';
  uid: number;
  profile_id: number;
  profile_uid: string;
  

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
          console.log(this.profile_id, this.profile_uid)
        });



    } catch (error) {
      console.error(error);
    }
  }

  onFileChanged(event) {
    this.selectedFile = event.target.files[0];
    this.changeName(this.selectedFile.name);
  }

  changeName(string): void {
    this.fileName = string;
  }

  public postFile(desc:string, tags:string) {
    
    if(this.selectedFile != null){

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
            let fid = event.fid[0]["value"];
  
            this.refresh_token().then(response => {
              if (response) {
                this.createPost(desc, tags, fid)
  
              }
            })
          });
  
  
      } catch (error) {
        console.error(error);
      } 

    }

  }

  public async createPost(desc:string, tags:string, fid:number) {

    let timestamp = new Date();
    let dateFormat = this.datepipe.transform(timestamp, 'yyyy-MM-ddTHH:mm:ss');

    var arrTags = tags.split(',');
    var objTags = arrTags.map(function(tag) {
      return {
          value: tag
      };
    });


    try {
      if (desc != null && tags != null && fid != null  ) {

        const httpOptionsPatch = {
          headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': localStorage.getItem("access_token")
          })
        };
        let body: any =
        {
          type: "posts",
          title: [{ value: "Post " + dateFormat.toLocaleString() }],
          field_post_profile: [
            {
              target_id: this.profile_id,
              target_type: "profile",
              target_uuid: this.profile_uid,
              url: "/profile/" + this.profile_id
            }
          ],
          field_post_image: [
            {
              target_id: fid
            }
          ],
          field_post_description: [{ value: desc }],
          field_post_tags: objTags,
          field_post_likes: [{ value: 0 }],
          field_post_created: [{ value: dateFormat }],

        }


        this.http.post(`http://localhost:8888/node?_format=json`, body, httpOptionsPatch)
          .subscribe(event => {
            console.log(event);
            this.refresh_token();
            this.router.navigate(["posts"]);
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

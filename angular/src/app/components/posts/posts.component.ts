import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Profile } from '../../models/profile';
import { User } from '../../models/user';
import { Post } from '../../models/post';
import { UserService } from '../../services/user.service';

import { PostService } from "../../services/post.service";
import { JsonObject } from '../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileImg, ImgAttributes } from '../../models/profile_picture';
import { LocalstorageService } from "../../services/localstorage.service";
import { HttpParams, HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common'


@Component({
  selector: 'app-posts',
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.scss'],
  encapsulation: ViewEncapsulation.None


})
export class PostsComponent implements OnInit {
  public profile: Profile;
  public userAuth: User[];
  public user: User;

  public posts: Post[];


  id = localStorage.getItem("uuid");
  profile_id: string;
  datepipe: DatePipe = new DatePipe('en-US');
  bool: Boolean;


  @ViewChild('navTemplate', { read: TemplateRef }) navTemplate: TemplateRef<any>;

  constructor(
    private userService: UserService,
    private postService: PostService,
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
      this.userAuth = res.data;
      console.log(this.userAuth);
    } catch (error) {
      console.error(error);
    }
  }

  public async getPosts(): Promise<void> {
    try {
      const res = await this.postService.getPosts<JsonObject>();
      this.posts = res.data;

      for (let i = 0; i < res.data.length; i++) {

        this.posts[i].user_id = res.data[i]["relationships"]["revision_uid"]["data"]["id"]
        let profile_id = res.data[i]["relationships"]["field_post_profile"]["data"]["id"]
        let post_img_href = res.data[i]["relationships"]["field_post_image"]["links"]["related"]["href"]

        //console.log(res.data[i]["relationships"]["field_post_image"]["links"]["related"]["href"])

        this.http.get<JsonObject>(`http://localhost:8888/jsonapi/user/user/${this.posts[i].user_id}`)
              .subscribe(event => {

                this.posts[i].username = event.data["attributes"]["name"]

       })

       this.http.get<JsonObject>(`http://localhost:8888/jsonapi/profile/user/${profile_id}/field_profile_picture`)
       .subscribe(event => {

         this.posts[i].profile_img = event.data


        
       })

       this.http.get<JsonObject>(`${post_img_href}`)
       .subscribe(event => {

         this.posts[i].post_img = event.data

        
       })
      }

    } catch (error) {
      console.error(error);
    }
  }

  public async patchLikes(id: number, $event) {

    let obj = this.posts.find(x => x.attributes.drupal_internal__nid == id);
    obj.attributes.field_post_likes = Number(obj.attributes.field_post_likes) + 1

    try {

      const httpOptionsPatch = {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Authorization': localStorage.getItem("access_token")
        })
      };

      let body: any =
      {
        type: "posts",
        field_post_likes: [
          {
              value: obj.attributes.field_post_likes
          }
      ]

      }

      this.http.patch(`http://localhost:8888/node/${id}?_format=json`, body, httpOptionsPatch)
        .subscribe(event => {
          console.log(event);
          this.refresh_token();
          

        })

    } catch (error) {
      console.error(error);
    }

  }

  public async deletePost(id: number) {

    let deleteObj = this.posts.find(x => x.attributes.drupal_internal__nid == id);
    this.posts = this.posts.filter(obj => obj !== deleteObj);

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
         // this.refreshPage();
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
          this.getPosts();

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

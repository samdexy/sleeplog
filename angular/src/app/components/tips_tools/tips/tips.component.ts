import { Component, OnInit, ViewChild, Input, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Profile } from '../../../models/profile';
import { User } from '../../../models/user';
import { Tip } from '../../../models/tip';
import { ProfileService } from '../../../services/profile.service';
import { UserService } from '../../../services/user.service';
import { TipsToolsService } from "../../../services/tipstools.service";
import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileImg, ImgAttributes } from '../../../models/profile_picture';
import { HttpParams, HttpClient } from '@angular/common/http';
import { DatePipe } from '@angular/common'


@Component({
  selector: 'app-tips',
  templateUrl: './tips.component.html',
  styleUrls: ['./tips.component.scss'],
  encapsulation: ViewEncapsulation.None


})
export class TipsComponent implements OnInit {

  @Input() tipsTemplate: TemplateRef<any>;

  public profile: Profile;
  public user: User[];
  public tips: Tip[];

  id = localStorage.getItem("uuid");


  @ViewChild('navTemplate', { read: TemplateRef }) navTemplate: TemplateRef<any>;

  constructor(
    private userService: UserService,
    private tipstoolsService: TipsToolsService,
    private router: Router,

  ) { }

  ngOnInit() {

    if (localStorage.access_token) {

      this.getUser();
      this.getTips();

    }
    else {
      this.router.navigate(["login"]);
    }
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

  public async getTips(): Promise<void> {
    try {
      const res = await this.tipstoolsService.getTips<JsonObject>();
      this.tips = res.data;

    } catch (error) {
      console.error(error);
    }
  }





}

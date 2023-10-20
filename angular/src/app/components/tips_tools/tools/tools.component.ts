import { Component, OnInit, ViewChild, TemplateRef, ViewEncapsulation } from '@angular/core';
import { Profile } from '../../../models/profile';
import { User } from '../../../models/user';
import { Tool } from '../../../models/tool';
import { UserService } from '../../../services/user.service';
import { TipsToolsService } from "../../../services/tipstools.service";
import { JsonObject } from '../../../models/json';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileImg, ImgAttributes } from '../../../models/profile_picture';
import { LocalstorageService } from "../../../services/localstorage.service";
import { HttpParams, HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { DatePipe } from '@angular/common'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-tools',
  templateUrl: './tools.component.html',
  styleUrls: ['./tools.component.scss'],
  encapsulation: ViewEncapsulation.None


})
export class ToolsComponent implements OnInit {
  public profile: Profile;
  public user: User[];
  public tools: Tool[];
  public profile_picture: ProfileImg[];


  id = localStorage.getItem("uuid");
  profile_id: string;
  datepipe: DatePipe = new DatePipe('en-US');
  bool: Boolean;

  @ViewChild('navTemplate', { read: TemplateRef }) navTemplate: TemplateRef<any>;
  @ViewChild('tipsTemplate', { read: TemplateRef }) tipsTemplate: TemplateRef<any>;

  constructor(
    private userService: UserService,
    private tipstoolsService: TipsToolsService,
    private router: Router,
    private http: HttpClient,
    private _sanitizer: DomSanitizer

  ) { }

  ngOnInit() {

    if (localStorage.access_token) {
      console.log(this.id)
      this.bool = true;
      this.getUser();
      this.getTools();
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

  public async getTools(): Promise<void> {
    try {
      const res = await this.tipstoolsService.getTools<JsonObject>();
      this.tools = res.data;

      for (let i = 0; i < res.data.length; i++) {

        let safeURL = this._sanitizer.bypassSecurityTrustResourceUrl(this.tools[i].attributes.field_link["uri"]);

        this.tools[i].attributes.field_link = safeURL
      }

    } catch (error) {
      console.error(error);
    }
  }


}

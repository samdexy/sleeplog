import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileEditComponent } from './components/profile/profile-edit/profile-edit.component';
import { GoalCreateComponent } from './components/profile/goal-create/goal-create.component';
import { GoalEditComponent } from './components/profile/goal-edit/goal-edit.component';
import { TestComponent } from './components/profile/test/test.component';

import { EntryComponent } from './components/track/entries.component';
import { EntryCreateComponent } from './components/track/entry-create/entry-create.component';
import { EntryEditComponent } from './components/track/entry-edit/entry-edit.component';
import { StatsComponent } from './components/track/stats/stats.component';
import { MapComponent } from './components/map/map.component';
import { ProfileShowComponent } from './components/map/show/profile-show.component';
import { ProfileSearchComponent } from './components/map/search/profile-search.component';
import { RequestsComponent } from './components/map/requests/requests.component';
import { ToolsComponent } from './components/tips_tools/tools/tools.component';
import { TipsComponent } from './components/tips_tools/tips/tips.component';
import { PostsComponent } from './components/posts/posts.component';
import { PostCreateComponent } from './components/posts/post-create/post-create.component';
import { PostEditComponent } from './components/posts/post-edit/post-edit.component';

import { StarRatingModule } from 'angular-star-rating';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatTabsModule} from '@angular/material/tabs';

import { NavComponent } from './components/nav/nav.component';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { ChartsModule } from 'ng2-charts';
import { OrderModule } from 'ngx-order-pipe';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ProfileComponent,
    NavComponent,
    RegisterComponent,
    ProfileEditComponent,
    GoalCreateComponent,
    GoalEditComponent,
    TestComponent,
    EntryComponent,
    EntryCreateComponent,
    EntryEditComponent,
    StatsComponent,
    MapComponent,
    ProfileShowComponent,
    ProfileSearchComponent,
    RequestsComponent,
    ToolsComponent,
    TipsComponent,
    PostsComponent,
    PostCreateComponent,
    PostEditComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    StarRatingModule.forRoot(),
    BrowserAnimationsModule,
    MatTabsModule,
    ChartsModule,
    OrderModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDrP8Jy6diRTKzGszIq5mkvHXR0Qn62Ro4'
    })
      ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

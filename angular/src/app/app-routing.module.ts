import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


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
import { MapComponent } from './components/map/map.component';
import { ProfileShowComponent } from './components/map/show/profile-show.component';
import { ProfileSearchComponent } from './components/map/search/profile-search.component';
import { RequestsComponent } from './components/map/requests/requests.component';
import { ToolsComponent } from './components/tips_tools/tools/tools.component';
import { TipsComponent } from './components/tips_tools/tips/tips.component';
import { PostsComponent } from './components/posts/posts.component';
import { PostCreateComponent } from './components/posts/post-create/post-create.component';
import { PostEditComponent } from './components/posts/post-edit/post-edit.component';

const routes: Routes = [
  { path: '', redirectTo: '/profile', pathMatch: 'full' },
  { path: 'profile', component: ProfileComponent},

  { path: 'profile/edit/:id', component: ProfileEditComponent },
  { path: 'profile/goal/add/:id', component: GoalCreateComponent },
  { path: 'profile/goal/edit/:id', component: GoalEditComponent },
  { path: 'profile/test/:id', component: TestComponent },

  { path: 'track', component: EntryComponent },
  { path: 'track/add', component: EntryCreateComponent },
  { path: 'track/edit/:id', component: EntryEditComponent },
  { path: 'map', component: MapComponent },
  { path: 'map/profile/:id', component: ProfileShowComponent },
  { path: 'map/search', component: ProfileSearchComponent },
  { path: 'map/requests', component: RequestsComponent },
  { path: 'tipstools', component: ToolsComponent },
  { path: 'posts', component: PostsComponent },
  { path: 'posts/add', component: PostCreateComponent },
  { path: 'posts/edit/:id', component: PostEditComponent },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}

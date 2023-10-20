import { Timestamp } from "rxjs";
import { ProfileImg } from './profile_picture';
import { GenericFile } from './file';

export class Post {
    type = 'node--posts';
    attributes: Attributes;
    username: String
    user_id: String
    profile_img: ProfileImg[];
    post_img: GenericFile[];

    }
  
    export class Attributes {
      drupal_internal__nid: number;
      field_post_likes: number;
      field_post_tags: Object;
      field_post_description: String
      field_post_created: Timestamp<any>;
      field_post_image: Object;

    }
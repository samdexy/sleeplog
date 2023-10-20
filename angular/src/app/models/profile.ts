
import { ProfileImg } from './profile_picture';

export class Profile {
  id: string;
  profile_id: number;
  friend: boolean;
  requested: boolean;
  type = 'profile--user';
  attributes: Attributes;
  username: String;
  profile_img: ProfileImg[];
  }

  export class Attributes {
    name: string;
    distance: Number;
    field_school: string;
    field_location: string;
    field_birthday: string;
    field_tagline: string;
    field_lng: string;
    field_lat: string;
    revision_id: number;
  }
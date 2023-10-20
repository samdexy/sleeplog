import { SafeResourceUrl } from "@angular/platform-browser";

export class Tool {
    type = 'node--tools';
    attributes: Attributes;
    }
  
    export class Attributes {
      title: String;
      field_description: String
      field_link: SafeResourceUrl;

    }
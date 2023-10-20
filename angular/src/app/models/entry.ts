import { Timestamp } from "rxjs";

export class Entry {
    type = 'node--entries';
    attributes: Attributes;
    }
  
    export class Attributes {
      field_bedtime: String;
      field_risen: String
      field_created: Timestamp<any>;

      field_note: String;
      field_quality: Number;
      field_rested: Number;


    }
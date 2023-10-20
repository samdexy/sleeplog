import { TestBed } from '@angular/core/testing';

import { TipsToolsService } from './tipstools.service';

describe('TipsToolsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TipsToolsService = TestBed.get(TipsToolsService);
    expect(service).toBeTruthy();
  });
});

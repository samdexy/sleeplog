import { TestBed } from '@angular/core/testing';

import { GoalService } from './goal.service';

describe('UserService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GoalService = TestBed.get(GoalService);
    expect(service).toBeTruthy();
  });
});

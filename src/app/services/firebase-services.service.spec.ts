import { TestBed } from '@angular/core/testing';

import { FirebaseServicesService } from './firebase-services.service';

describe('FirebaseServicesService', () => {
  let service: FirebaseServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FirebaseServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VocabularyList } from './vocabulary-list';

describe('VocabularyList', () => {
  let component: VocabularyList;
  let fixture: ComponentFixture<VocabularyList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VocabularyList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VocabularyList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

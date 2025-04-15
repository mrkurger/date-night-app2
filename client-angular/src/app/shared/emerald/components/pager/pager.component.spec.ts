import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PagerComponent } from './pager.component';
import { CommonModule } from '@angular/common';

describe('PagerComponent', () => {
  let component: PagerComponent;
  let fixture: ComponentFixture<PagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [PagerComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PagerComponent);
    component = fixture.componentInstance;
    
    // Set default values for testing
    component.currentPage = 3;
    component.totalPages = 10;
    component.maxVisiblePages = 5;
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate visible pages correctly', () => {
    // For currentPage = 3, totalPages = 10, maxVisiblePages = 5
    // Expected visible pages: [1, 2, 3, 4, 5]
    expect(component.visiblePages).toEqual([1, 2, 3, 4, 5]);
    
    // Change current page to 8
    component.currentPage = 8;
    component.ngOnChanges({
      currentPage: { currentValue: 8, previousValue: 3, firstChange: false, isFirstChange: () => false }
    });
    
    // Expected visible pages: [6, 7, 8, 9, 10]
    expect(component.visiblePages).toEqual([6, 7, 8, 9, 10]);
    
    // Change max visible pages
    component.maxVisiblePages = 3;
    component.ngOnChanges({
      maxVisiblePages: { currentValue: 3, previousValue: 5, firstChange: false, isFirstChange: () => false }
    });
    
    // Expected visible pages: [7, 8, 9]
    expect(component.visiblePages).toEqual([7, 8, 9]);
  });

  it('should emit pageChange event when a page is clicked', () => {
    spyOn(component.pageChange, 'emit');
    
    // Get the page buttons
    const pageButtons = fixture.debugElement.queryAll(By.css('.emerald-pager__button--page'));
    
    // Click on page 4
    pageButtons[3].nativeElement.click();
    
    // Expect pageChange to be emitted with page 4
    expect(component.pageChange.emit).toHaveBeenCalledWith(4);
  });

  it('should emit pageChange event when next button is clicked', () => {
    spyOn(component.pageChange, 'emit');
    
    // Get the next button
    const nextButton = fixture.debugElement.query(By.css('.emerald-pager__button--next'));
    
    // Click on next button
    nextButton.nativeElement.click();
    
    // Expect pageChange to be emitted with page 4 (current page + 1)
    expect(component.pageChange.emit).toHaveBeenCalledWith(4);
  });

  it('should emit pageChange event when previous button is clicked', () => {
    spyOn(component.pageChange, 'emit');
    
    // Get the previous button
    const prevButton = fixture.debugElement.query(By.css('.emerald-pager__button--prev'));
    
    // Click on previous button
    prevButton.nativeElement.click();
    
    // Expect pageChange to be emitted with page 2 (current page - 1)
    expect(component.pageChange.emit).toHaveBeenCalledWith(2);
  });

  it('should disable previous button on first page', () => {
    component.currentPage = 1;
    fixture.detectChanges();
    
    // Get the previous button
    const prevButton = fixture.debugElement.query(By.css('.emerald-pager__button--prev'));
    
    // Expect previous button to be disabled
    expect(prevButton.nativeElement.disabled).toBeTruthy();
  });

  it('should disable next button on last page', () => {
    component.currentPage = 10;
    fixture.detectChanges();
    
    // Get the next button
    const nextButton = fixture.debugElement.query(By.css('.emerald-pager__button--next'));
    
    // Expect next button to be disabled
    expect(nextButton.nativeElement.disabled).toBeTruthy();
  });

  it('should highlight the current page', () => {
    // Get the page buttons
    const pageButtons = fixture.debugElement.queryAll(By.css('.emerald-pager__button--page'));
    
    // Expect the third button (page 3) to have the active class
    expect(pageButtons[2].nativeElement.classList).toContain('emerald-pager__button--active');
  });

  it('should show page size selector when showPageSize is true', () => {
    // Initially, page size selector should not be shown
    let pageSizeSelector = fixture.debugElement.query(By.css('.emerald-pager__size-selector'));
    expect(pageSizeSelector).toBeNull();
    
    // Set showPageSize to true
    component.showPageSize = true;
    fixture.detectChanges();
    
    // Now, page size selector should be shown
    pageSizeSelector = fixture.debugElement.query(By.css('.emerald-pager__size-selector'));
    expect(pageSizeSelector).toBeTruthy();
  });

  it('should emit pageSizeChange event when page size is changed', () => {
    spyOn(component.pageSizeChange, 'emit');
    
    // Set showPageSize to true
    component.showPageSize = true;
    fixture.detectChanges();
    
    // Get the page size selector
    const pageSizeSelector = fixture.debugElement.query(By.css('#pageSize'));
    
    // Change the page size
    pageSizeSelector.nativeElement.value = '25';
    pageSizeSelector.nativeElement.dispatchEvent(new Event('change'));
    
    // Expect pageSizeChange to be emitted with page size 25
    expect(component.pageSizeChange.emit).toHaveBeenCalledWith(25);
  });

  it('should apply the correct CSS classes based on style, size, and align props', () => {
    // Get the pager container
    const pagerContainer = fixture.debugElement.query(By.css('.emerald-pager'));
    
    // Initially, no style, size, or align classes should be applied
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--simple');
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--compact');
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--small');
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--large');
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--left');
    expect(pagerContainer.nativeElement.classList).not.toContain('emerald-pager--right');
    
    // Set style, size, and align props
    component.style = 'simple';
    component.size = 'small';
    component.align = 'left';
    fixture.detectChanges();
    
    // Now, the corresponding classes should be applied
    expect(pagerContainer.nativeElement.classList).toContain('emerald-pager--simple');
    expect(pagerContainer.nativeElement.classList).toContain('emerald-pager--small');
    expect(pagerContainer.nativeElement.classList).toContain('emerald-pager--left');
  });
});
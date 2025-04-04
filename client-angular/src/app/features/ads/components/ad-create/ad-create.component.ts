import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdService } from '../../../services/ad.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ad-create',
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.css']
})
export class AdCreateComponent {
  adForm: FormGroup;
  error: string | null = null;

  constructor(private fb: FormBuilder, private adService: AdService, private router: Router) {
    this.adForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      category: ['', Validators.required]
    });
  }

  createAd(): void {
    if (this.adForm.invalid) {
      return;
    }
    this.adService.createAd(this.adForm.value).subscribe({
      next: ad => this.router.navigate(['/ad-details', ad._id]),
      error: err => this.error = 'Failed to create ad'
    });
  }
}

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AdService } from '../../../../core/services/ad.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ad-create',
  templateUrl: './ad-create.component.html',
  styles: [`
    .form-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .error-message {
      color: #dc3545;
      margin-top: 5px;
    }
    .submit-button {
      margin-top: 20px;
    }
  `],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink]
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

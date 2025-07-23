import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field'; // For form fields
import { MatInputModule } from '@angular/material/input';         // For input fields
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // For toggles
import { MatSelectModule } from '@angular/material/select';       // For select dropdowns
import { MatRadioModule } from '@angular/material/radio';         // For radio buttons
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // For reactive forms

// Define the interface for your application settings
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  language: 'en' | 'es' | 'fr';
  itemsPerPage: number;
}

@Component({
  selector: 'app-dialog-content',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatRadioModule,
    ReactiveFormsModule, // Import ReactiveFormsModule
    MatDialogModule
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class DialogContentComponent implements OnInit {
  settingsForm!: FormGroup; // Use definite assignment assertion

  constructor(
    public dialogRef: MatDialogRef<DialogContentComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title: string; currentSettings: AppSettings }
  ) {}

  ngOnInit(): void {
    // Initialize the form with the current settings passed from the opening component
    this.settingsForm = new FormGroup({
      theme: new FormControl(this.data.currentSettings.theme, Validators.required),
      notificationsEnabled: new FormControl(this.data.currentSettings.notificationsEnabled),
      language: new FormControl(this.data.currentSettings.language, Validators.required),
      itemsPerPage: new FormControl(this.data.currentSettings.itemsPerPage, [
        Validators.required,
        Validators.min(5),
        Validators.max(100)
      ])
    });
  }

  onCancelClick(): void {
    // Close the dialog without saving changes (pass null or undefined)
    this.dialogRef.close(null);
  }

  onSaveClick(): void {
    if (this.settingsForm.valid) {
      // Close the dialog and pass the updated settings
      this.dialogRef.close(this.settingsForm.value as AppSettings);
    }
  }
}

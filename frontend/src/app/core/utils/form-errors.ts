import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ApiFieldErrors } from '../models/api.models';

/** Slovak messages for client-side validators. */
export function controlErrorMessage(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) return null;
  const e = control.errors;
  if (e['server']) return e['server'] as string;
  // Validators.requiredTrue reports `required` – for checkboxes show a consent message.
  if (e['required'] && control.value === false) return 'Na odoslanie je potrebný váš súhlas.';
  if (e['required']) return 'Toto pole je povinné.';
  if (e['email']) return 'Zadajte platnú e-mailovú adresu.';
  if (e['minlength']) return `Zadajte aspoň ${e['minlength'].requiredLength} znaky.`;
  if (e['maxlength']) return `Maximálne ${e['maxlength'].requiredLength} znakov.`;
  if (e['min']) return `Najmenšia povolená hodnota je ${e['min'].min}.`;
  if (e['max']) return `Najväčšia povolená hodnota je ${e['max'].max}.`;
  if (e['phone']) return 'Zadajte platné telefónne číslo, napr. +421 900 123 456.';
  return 'Skontrolujte prosím zadanú hodnotu.';
}

export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;
  const digits = value.replace(/\D/g, '').length;
  return /^\+?[0-9 ()/-]{9,20}$/.test(value) && digits >= 9 ? null : { phone: true };
};

/**
 * Maps a DRF 400 response onto form controls. Returns a general message for
 * errors that cannot be attached to a specific field.
 */
export function applyServerErrors(form: FormGroup, error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) return 'Niečo sa pokazilo. Skúste to prosím znova.';
  if (error.status === 0) return 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie a skúste to znova.';
  if (error.status === 429) return 'Odoslali ste priveľa formulárov za krátky čas. Skúste to prosím o chvíľu.';
  if (error.status !== 400 || typeof error.error !== 'object' || error.error === null) {
    return 'Na serveri nastala chyba. Zavolajte nám prosím alebo to skúste neskôr.';
  }

  const body = error.error as ApiFieldErrors;
  const general: string[] = [];
  for (const [field, messages] of Object.entries(body)) {
    const text = Array.isArray(messages) ? messages.join(' ') : String(messages);
    const control = form.get(field);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: text });
      control.markAsTouched();
    } else {
      general.push(text);
    }
  }
  return general.length ? general.join(' ') : 'Skontrolujte prosím zvýraznené polia formulára.';
}

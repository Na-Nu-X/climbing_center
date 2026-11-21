import { ResourceRef } from '@angular/core';

export type ViewState = 'loading' | 'error' | 'empty' | 'ready';

/** Collapses a list resource into a single UI state for `<app-state-message>`. */
export function listViewState<T>(ref: ResourceRef<T[] | undefined>): ViewState {
  if (ref.error()) return 'error';
  if (!ref.hasValue()) return 'loading';
  return (ref.value() ?? []).length ? 'ready' : 'empty';
}

/** Safe value read: `value()` throws while a resource is in the error state. */
export function listValue<T>(ref: ResourceRef<T[] | undefined>): T[] {
  return ref.hasValue() ? (ref.value() ?? []) : [];
}

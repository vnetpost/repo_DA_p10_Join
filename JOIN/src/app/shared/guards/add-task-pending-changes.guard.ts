import { CanDeactivateFn } from '@angular/router';
import { AddTask } from '../../main-page/add-task/add-task';

/**
 * Prevents leaving the routed add-task page while unsaved changes are present.
 *
 * Uses the add-task component's existing confirm box instead of a browser dialog.
 *
 * @param component Routed add-task component instance.
 * @returns Immediate permission or a promise resolved by the component.
 */
export function addTaskPendingChangesGuard(component: AddTask): ReturnType<CanDeactivateFn<AddTask>> {
  return component.confirmNavigationAway();
}

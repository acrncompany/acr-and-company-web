import { Pipe, PipeTransform } from '@angular/core';

/** The admin lives under this path of the website. Screens and the API's `adminPath` values are written without it ("/services"). */
export const ADMIN_BASE = '/admin';

export const adminUrl = (path: string): string => (path === '/' || path === '' ? ADMIN_BASE : ADMIN_BASE + path);

/** `[routerLink]="path | adminUrl"` */
@Pipe({ name: 'adminUrl' })
export class AdminUrlPipe implements PipeTransform {
  transform(path: string): string {
    return adminUrl(path);
  }
}

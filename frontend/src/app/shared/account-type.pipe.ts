import { Pipe, PipeTransform } from '@angular/core';
import { ACCOUNT_TYPES } from '../core/models';

@Pipe({ name: 'accountType' })
export class AccountTypePipe implements PipeTransform {
  transform(type: string): string {
    return ACCOUNT_TYPES.find(t => t.value === type)?.label ?? type;
  }
}

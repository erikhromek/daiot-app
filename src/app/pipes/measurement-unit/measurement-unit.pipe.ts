import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'measurementUnit'
})
export class MeasurementUnitPipe implements PipeTransform {

  transform(value: number | undefined, unit: string | undefined, ...args: unknown[]): string {
    return `${value} ${unit}`;
  }
}

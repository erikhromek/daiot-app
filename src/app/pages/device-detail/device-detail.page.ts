import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { StatusHighlightModule } from 'src/app/directives/status-highlight/status-highlight.module';
import { MeasurementUnitModule } from 'src/app/pipes/measurement-unit/measurement-unit.module';
import { BehaviorSubject, Observable, finalize, tap } from 'rxjs';
import { Device } from 'src/app/models/device';
import { DeviceService } from 'src/app/services/device.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import * as Highcharts from 'highcharts/highcharts';
import HC_more from 'highcharts/highcharts-more';
HC_more(Highcharts);
import HighchartsSolidGauge from 'highcharts/modules/solid-gauge';
import { HighchartsChartModule } from 'highcharts-angular';
import { MeasurementService } from 'src/app/services/measurement.service';
import { Measurement } from 'src/app/models/measurement';
import { DataSerie } from 'src/app/models/data-serie';
HighchartsSolidGauge(Highcharts);

@Component({
  selector: 'app-device-detail',
  templateUrl: './device-detail.page.html',
  styleUrls: ['./device-detail.page.scss'],
  standalone: true,
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    StatusHighlightModule,
    MeasurementUnitModule,
    RouterLink,
    HighchartsChartModule,
  ],
})
export class DeviceDetailPage implements ViewWillEnter {
  @ViewChild('container', { read: ElementRef }) container:
    | ElementRef
    | undefined;
  device$!: Observable<Device>;
  measurements$!: Observable<Measurement[]>;
  deviceId!: string;
  device!: Device;
  temperatureChart: typeof Highcharts = Highcharts;
  temperatureChartOptions!: Highcharts.Options;
  pressureChart: typeof Highcharts = Highcharts;
  pressureChartOptions!: Highcharts.Options;
  isLoading$: BehaviorSubject<Boolean> = new BehaviorSubject<Boolean>(true);

  // NOTE: Used to store data for graph
  temperatures: DataSerie[] = [];
  pressures: DataSerie[] = [];
  humidities: DataSerie[] = [];

  constructor(
    private deviceService: DeviceService,
    private measurementService: MeasurementService,
    private actRout: ActivatedRoute
  ) {}

  ionViewWillEnter(): void {
    this.getDeviceId();
    this.getDevice();
  }

  private getDeviceId(): void {
    this.deviceId = String(this.actRout.snapshot.paramMap.get('id'));
  }

  private getDevice(): void {
    this.device$ = this.deviceService.getOne(this.deviceId).pipe(
      tap((device: Device) => {
        this.device = device;
        this.getMeasurements();
      }),
      finalize(() => this.isLoading$.next(false))
    );
  }

  private getMeasurements(): void {
    this.measurements$ = this.measurementService.getAll(this.deviceId).pipe(
      tap((measurements: Measurement[]) => {
        this.mapMeasurementsToData(measurements);
      }),
      finalize(() => this.isLoading$.next(false))
    );
  }
  private mapMeasurementsToData(measurements: Measurement[]): void {
    measurements.forEach((measurement) => {
      const datetime = new Date(measurement.datetime).getTime();
      this.temperatures.push({ value: measurement.temperature, datetime });
      this.pressures.push({ value: measurement.pressure / 1000, datetime });
      this.humidities.push({ value: measurement.humidity, datetime });
    });
    this.makeTemperatureChart();
    this.makePressureChart();
  }

  public sendCommand(): void {
    this.deviceService.sendCommand(this.device.id).subscribe(() => {

    });
  }

  public makeTemperatureChart(): void {
    this.temperatureChartOptions = {
      chart: {
        type: 'spline',
      },
      title: {
        text: 'Latest temperature measurements',
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      },
      yAxis: {
        title: {
          text: 'Temperature (°C)',
        },
      },
      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%m-%d %H:%M}',
        },
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false,
      },
      colors: ['#6CF'],
      series: [
        {
          name: 'Temperature (°C)',
          type: 'spline',
          data: this.temperatures.map((temperature) => [
            temperature.datetime,
            temperature.value,
          ]),
        },
      ],
    };
  }

  public makePressureChart(): void {
    this.pressureChartOptions = {
      chart: {
        type: 'spline',
      },
      title: {
        text: 'Latest pressure measurements',
      },
      plotOptions: {
        series: {
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: false,
              },
            },
          },
        },
      },
      yAxis: {
        title: {
          text: 'Temperature (hPa)',
        },
      },
      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%m-%d %H:%M}',
        },
      },
      legend: {
        enabled: false
      },
      credits: {
        enabled: false,
      },
      colors: ['#ff6680'],
      series: [
        {
          name: 'Pressure (hPa)',
          type: 'spline',
          data: this.pressures.map((pressures) => [
            pressures.datetime,
            pressures.value,
          ]),
        },
      ],
    };
  }
}

import {
  AfterViewInit,
  Component,
  ElementRef,
  ViewChild,
  viewChild,
} from '@angular/core';
import {
  ColorType,
  createChart,
  IChartApi,
  ISeriesApi,
  Time,
  UTCTimestamp,
} from 'lightweight-charts';

@Component({
  selector: 'app-chart',
  standalone: true,
  imports: [],
  templateUrl: './chart.component.html',
  styleUrl: './chart.component.scss',
})
export class ChartComponent implements AfterViewInit {
  ngAfterViewInit(): void {
    this.initializeChart();
    this.addCandles();
    this.addPositionMarkers();
  }
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private chart: any;
  private series: any;

  private positions = [
    {
      startTime: '2023-12-01', // Matches a candle
      endTime: '2023-12-02', // Matches a candle
      entryPrice: 106,
      exitPrice: 112,
      type: 'long',
    },
    {
      startTime: '2023-12-02', // Matches a candle
      endTime: '2023-12-03', // Matches a candle
      entryPrice: 108,
      exitPrice: 102,
      type: 'short',
    },
  ];

  private candles = [
    { time: '2023-12-01' as Time, open: 100, high: 110, low: 95, close: 105 },
    { time: '2023-12-02' as Time, open: 105, high: 115, low: 100, close: 110 },
    { time: '2023-12-03' as Time, open: 110, high: 120, low: 105, close: 115 },
  ];

  ngOnInit(): void {}

  initializeChart(): void {
    this.chart = createChart(this.chartContainer.nativeElement, {
      width: 700,
      height: 400,
      layout: {
        background: {
          type: ColorType.Solid,
          color: '#121212',
        },
        textColor: '#FFFFFF',
      },
      grid: {
        vertLines: {
          color: '#e1e1e1',
        },
        horzLines: {
          color: '#e1e1e1',
        },
      },
      timeScale: {
        borderVisible: false,
      },
    });

    this.series = this.chart.addCandlestickSeries();
  }

  addCandles(): void {
    this.series.setData(this.candles);
  }

  addPositionMarkers(): void {
    console.log('here');

    this.positions.forEach((position) => {
      const startTime = (new Date(position.startTime).getTime() /
        1000) as UTCTimestamp;
      const endTime = (new Date(position.endTime).getTime() /
        1000) as UTCTimestamp;

      const priceRange = {
        top: Math.max(position.entryPrice, position.exitPrice),
        bottom: Math.min(position.entryPrice, position.exitPrice),
      };

      // Convert time and price to coordinates
      const timeScale = this.chart.timeScale();
      const startCoordinate = timeScale.timeToCoordinate({
        timestamp: startTime,
      } as any);
      const endCoordinate = timeScale.timeToCoordinate({
        timestamp: endTime,
      } as any);
      const topCoordinate = this.series.priceToCoordinate(priceRange.top);
      const bottomCoordinate = this.series.priceToCoordinate(priceRange.bottom);

      console.log('Start coordinate:', startCoordinate);
      console.log('End coordinate:', endCoordinate);
      console.log('Top coordinate:', topCoordinate);
      console.log('Bottom coordinate:', bottomCoordinate);

      if (
        startCoordinate !== null &&
        endCoordinate !== null &&
        topCoordinate !== null &&
        bottomCoordinate !== null
      ) {
        // Get chart canvas container
        const chartContainer = this.chartContainer.nativeElement;

        // Create rectangle overlay
        const rectangle = document.createElement('div');
        rectangle.style.position = 'absolute';
        rectangle.style.left = `${Math.min(startCoordinate, endCoordinate)}px`;
        rectangle.style.width = `${Math.abs(
          endCoordinate - startCoordinate
        )}px`;
        rectangle.style.top = `${Math.min(topCoordinate, bottomCoordinate)}px`;
        rectangle.style.height = `${Math.abs(
          bottomCoordinate - topCoordinate
        )}px`;
        rectangle.style.backgroundColor =
          position.type === 'long'
            ? 'rgba(0, 255, 0, 0.3)'
            : 'rgba(255, 0, 0, 0.3)';
        rectangle.style.border = '1px solid rgba(255, 255, 255, 0.5)';

        chartContainer.appendChild(rectangle);
      } else {
        console.warn(
          'Coordinates could not be calculated for position:',
          position
        );
      }
    });
  }
}

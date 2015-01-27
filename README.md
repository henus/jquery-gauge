# jquery-gauge

Simple circular gauge, based on jquery and SVG.

## Usage

```js
// by using global Gague class
var gauge = new Gauge($('.gauge'), options);
// or by jQuery-plugin
$('.gauge').gauge(options);
```

## Options

| Param | Default | Description |
|---|---|---|
| `angles` | `[150, 390]` | Start and end angles defining gauge’s aperture |
| `values` | `{0: '0', 50: '5', 100: '10'}` | List of labels corresponding to percentage values |
| `colors` | `{0:'gray', 50:'orange', 80:'red'}` | List of colors corresponding to percentage values |
| `value` | `0` | Initial value |
| `lineWidth` | `4` | Gauge circular line width |
| `arrowWidth` | `10` | Arrow width |
| `arrowColor` | `#1e98e4` | Arrow color |
| `inset` | `false` | Inner/outer labels |
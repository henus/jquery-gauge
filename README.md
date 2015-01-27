# jquery-gauge

Simple circular gauge, based on SVG.

## Usage

```js
var gauge = new Gauge($('.gauge'), options);
// or
$('.gauge').gauge(options);
```

## Options

| Param | Default | Description |
|---|---|---|
| `angles` | `[150, 390]` | Start and end angles defining gauge’s aperture |
| `values` | `{0: 'start', 100: 'end'}` | Dict of labels corresponding to percentage values |
| `colors` | `{0:'gray', 70:'orange', 90:'red'}` | Dict of colors corresponding to percentage values |
| `value` | `70` | Initial value |
| `lineWidth` | `4` | Gauge circular line width |
| `arrowWidth` | `10` | Arrow width |
| `arrowColor` | `#1e98e4` | Arrow color |
| `inset` | `false` | Inner/outer labels |
This library formats and transmits metrics.

# Usage

Include the library:

```
const Graphite = require('n-graphite');
```

Then:

```
const metrics = new Map([['http.req.mean', 100], ['http.req.count', 82]]);
Graphite({ host: 'graphite.ft.com', port: 3001 }).log(metrics);
```

By default the library will only transmit metrics in the production environment
(i.e. `NODE_ENV=production`) but you can disable this if needed.

```
Graphite({ host: 'graphite.ft.com', port: 3001, onlyLogProductionMetrics: false }).log(metrics);
```

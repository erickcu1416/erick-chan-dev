# React Components

Esta carpeta contiene componentes React para secciones interactivas del sitio.

## Uso en Astro

Para usar un componente React en Astro, importalo y usa una directiva `client:*`:

```astro
---
import MyComponent from '@components/react/MyComponent';
---

<!-- Se hidrata en el cliente cuando la página carga -->
<MyComponent client:load />

<!-- Se hidrata cuando el componente es visible -->
<MyComponent client:visible />

<!-- Se hidrata cuando el navegador está idle -->
<MyComponent client:idle />
```

## Directivas disponibles

- `client:load` - Hidrata inmediatamente al cargar la página
- `client:idle` - Hidrata cuando el navegador está idle
- `client:visible` - Hidrata cuando el componente es visible
- `client:media` - Hidrata cuando se cumple una media query
- `client:only="react"` - Solo renderiza en el cliente

## Ejemplo de componente

```tsx
// src/components/react/Counter.tsx
import { useState } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

Uso en Astro:
```astro
---
import Counter from '@components/react/Counter';
---

<Counter client:visible />
```

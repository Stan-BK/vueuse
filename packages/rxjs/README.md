# @vueuse/rxjs

[![NPM version](https://img.shields.io/npm/v/@vueuse/rxjs?color=a1b858)](https://www.npmjs.com/package/@vueuse/rxjs)

> This is an add-on of [VueUse](https://github.com/antfu), enabling a natural way of using RxJS.

## Install

```bash
npm i @vueuse/rxjs rxjs
```

## Functions

<!--GENERATED LIST, DO NOT MODIFY MANUALLY-->
<!--FUNCTIONS_LIST_STARTS-->

- [`from`](https://vueuse.org/rxjs/from/) — wrappers around RxJS's [`from()`](https://rxjs.dev/api/index/function/from) and [`fromEvent()`](https://rxjs.dev/api/index/function/fromEvent) to allow them to accept `ref`s
- [`toObserver`](https://vueuse.org/rxjs/toObserver/) — sugar function to convert a `ref` into an RxJS [Observer](https://rxjs.dev/guide/observer)
- [`useExtractedObservable`](https://vueuse.org/rxjs/useExtractedObservable/) — use an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more composables
- [`useObservable`](https://vueuse.org/rxjs/useObservable/) — use an RxJS [`Observable`](https://rxjs.dev/guide/observable)
- [`useSubject`](https://vueuse.org/rxjs/useSubject/) — bind an RxJS [`Subject`](https://rxjs.dev/guide/subject) to a `ref` and propagate value changes both ways
- [`useSubscription`](https://vueuse.org/rxjs/useSubscription/) — use an RxJS [`Subscription`](https://rxjs.dev/guide/subscription) without worrying about unsubscribing from it or creating memory leaks
- [`watchExtractedObservable`](https://vueuse.org/rxjs/watchExtractedObservable/) — watch the values of an RxJS [`Observable`](https://rxjs.dev/guide/observable) as extracted from one or more composables

<!--FUNCTIONS_LIST_ENDS-->

## Example

```ts
import { from, fromEvent, useObservable } from '@vueuse/rxjs'
import { forkJoin, of } from 'rxjs'
import { ajax } from 'rxjs/ajax'
import { concatAll, map, mergeMap, pluck, scan, take } from 'rxjs/operators'
import { useTemplateRef } from 'vue'

const BASE_URL = 'https://jsonplaceholder.typicode.com'
const button = useTemplateRef('buttonRef')

const posts = useObservable(
  fromEvent(button, 'click').pipe(
    mergeMap(() => ajax.getJSON(`${BASE_URL}/posts`).pipe(
      concatAll(),
      take(4),
      mergeMap(({ id, userId, title }) => forkJoin({
        id: of(id),
        comments: ajax.getJSON(`${BASE_URL}/posts/${id}/comments`).pipe(
          map(comments => comments.length),
        ),
        username: ajax.getJSON(`${BASE_URL}/users/${userId}`).pipe(
          pluck('username'),
        ),
      }), 2),
      scan((acc, curr) => [...acc, curr], []),
    )),
  ),
)
```

## License

[MIT License](https://github.com/vueuse/vueuse/blob/master/LICENSE) © 2019-PRESENT [Anthony Fu](https://github.com/antfu)

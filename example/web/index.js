import { EventTarget, } from 'event-target-shim';
import { registerPackage, invoke, addEventListener, removeEventListener, } from 'hybro';

window.addEventListener('DOMContentLoaded', function () {

  const a = {
    b: Object.assign(new EventTarget(), {
      c: function (...args) {
        return args.join();
      },
    }),
  };

  setInterval(() => {
    a.b.dispatchEvent({ type: 'e', data: { a: 1, }, });
  }, 1000);

  
  registerPackage('a', a);

  setTimeout(() => {
    invoke('a', 'b', 'c', [1, 'q'])
      .then(console.warn)
      .catch(console.error);

    addEventListener('a', 'b', 'e', console.warn)
      .then(console.warn)
      .catch(console.error);

    setTimeout(() => {
      removeEventListener('a', 'b', 'e', console.warn)
        .then(console.warn)
        .catch(console.error);
    }, 10000);
  }, 1000);

});

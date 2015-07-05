touch-options.js
================

A JS class to help you manage user settings with just on click/touch.





Author and License
-------------------

By Dani Gámez Franco, http://gmzcodes.com

Licensed under the [MIT license](http://opensource.org/licenses/MIT).





Versioning
----------

**CURRENT VERSION:** `1.0.0`

`touch-options.js` will be maintained under the [Semantic Versioning](http://semver.org) guidelines, so releases will be numbered with the following format when possible:

`MAJOR.MINOR.PATCH`

And constructed with the following guidelines:

1. Breaking backward compatibility bumps the `MAJOR` (and resets the minor and patch).
2. Adding functionality without breaking backward compatibility bumps the `MINOR` (and resets the patch).
3. Bug fixes and misc. changes bumps the `PATCH`.





TO-DO
-----
 - [ ] **Documentation**.
 - [ ] **Examples/tests**.
 - [ ] **`localStorage` naming**: Add a prefixs/suffix to `localStorage` properties created with this class.
 - [ ] **Bulk save**: Save (and load) every option in just one `localStorage` property.
 - [ ] **Text options**.
 - [ ] **Dynamic options**: Add the possibility of storing option's values alongside with its name, so that they can be loaded without knowing it. This can used to store user-defined custom options.
 - [ ] **Configurable storage**: Add a parameter to choose between `localStorage` or `chrome.storage`.

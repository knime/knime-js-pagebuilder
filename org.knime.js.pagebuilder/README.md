# PageBuilder for KNIME® Analytics Platform & WebPortal

This repository contains the frontend components of the PageBuilder based on the [Vue] JavaScript framework.
The PageBuilder is built as an [Vue library] and used in KNIME Analytics Platform and KNIME WebPortal web apps.

## Development

### Prerequisites

* Install [Node.js version 12][node].
* Only for test coverage uploads to SonarQube: you also need [Java]™ 8 or 11.

Newer versions may also work, but have not been tested.

Pull the contained [git submodules](https://stackoverflow.com/a/4438292/5134084) with
```sh
git submodule update --init
```

### Install dependencies

```sh
npm install
```

and then use the following commands. For detailed explanations see [Vue CLI docs]:


### Launch development server
Compiles all JavaScript sources, assets, … and starts a local web server with a demo app for development.
Includes hot-reloading, so code changes will be visible in the browser immediately.

```sh
npm run dev
```

### Launch development server for integration with Web Portal

When developing the [Web Portal], a web server with the built version of the library is required. This project provides
this via the command:

```sh
npm run dev-inte
```

This does not create an app on its own, only the library for usage in [Web Portal] dev mode. It starts a web server,
and re-builds the library on source file change. The web portal page then needs to be manually refreshed.

### Testing

#### Running unit tests
This project contains unit tests written with [jest].
They are run with

```sh
npm run test:unit
```

During development, you can use `npm run test:unit -- --watch` to have the unit tests run automatically whenever a
source file changes.

You can generate a coverage report with

```sh
npm run coverage
```

The output can be found in the `coverage` folder. It contains a browseable html report as well as raw coverage data in
[LCOV] and [Clover] format, which can be used in analysis software (SonarQube, Jenkins, …).

The following command allows you to upload the coverage data to SonarQube:

```sh
npm run sendcoverage
```
It requires the `SONAR_TOKEN` environment variable to be set, and contain a valid SonarQube authentication token.
Such token can be obtained from `https://<YOUR_SONARQUBE_HOST>/account/security/`.


### Running security audit

npm provides a check against known security issues of used dependencies. Run it by calling
```sh
npm audit
```

### Logging

You can log using the global `consola` variable (which the embedding application needs to provide).

See https://github.com/nuxt/consola for details.

## Building

To build the PageBuilder as [Vue library], use the following command:

```sh
npm run build
```

Results are saved to `/dist`.

This project can also be build via a maven build wrapper

```sh
mvn clean install
```

## Embedding the PageBuilder in apps

The PageBuilder can be used in Vue/Nuxt apps like a regular Vue component.
In the KNIME WebPortal the built version is loaded during runtime via HTTP.

For example, in a Nuxt+Axios app, the following Code creates the `PageBuilder` component globally:

```js
export default { // some page…
    async fetch({ $axios }) {
        if (window['knime-pagebuilder']) {
            return;
        }
        // `url` needs to point to the built component file (`knime-pagebuilder.umd.min.js`)
        eval(await $axios.$get(url, { headers: { 'Accept': 'application/javascript' } }));
        Vue.component('PageBuilder', window['knime-pagebuilder']);
    }
}
```
 
Integrating the source as a Git submodule and building it with the embedding app should also work, but was not tested
yet.

### Requirements

The PageBuilder expects that the embedding app provides the following:

- Vue, Vuex and Consola compatible to the versions defined in [`package.json`](package.json)
- global `window.consola` instance for logging
- an `action` property as described in the next section

### API
The component provides a store module namespaced as `pagebuilder`. All communication with the embedding app is achieved
via store actions. Therefore, the app must provide well-defined action implementations and pass them to the PageBuilder
component as an `action` prop like so:

```js
import actions from '~/pagebuilder-api/actions'; // must contain the outbound actions described below
```

```xml
<PageBuilder :actions="actions" />
```


#### Outbound (interface)

The following actions are required to be implemented by the embedding application:

##### `messageToParent` (example)

Receives a generic message from the PageBuilder.

###### Parameters:

* anything

###### Example:

```js
// pagebuilder-api/actions.js
export const actions = {
    messageToParent({ commit }, value) {
        consola.trace('Message from inside:', value);
        commit('setGlobal', value, { root: true }); // dummy store action on the global (non-namespaced) store
    }
};

```


#### Inbound

These actions are implemented by the PageBuilder and can be dispatched by the embedding application:

##### `pagebuilder/messageFromOutside` (example)

Sends a generic message to the PageBuilder.

###### Parameters:

* anything

###### Example:

```js
this.$store.dispatch('pagebuilder/messageFromOutside', 'Hello World!');
```


[Vue]: https://vuejs.org/
[node]: https://nodejs.org/en/download/
[Java]: https://www.oracle.com/technetwork/java/javase/downloads/index.html
[Vue CLI docs]: https://cli.vuejs.org/guide/
[Vue library]: https://cli.vuejs.org/guide/build-targets.html#library
[Nightwatch.js]: http://nightwatchjs.org/
[jest]: https://jestjs.io/en
[LCOV]: https://github.com/linux-test-project/lcov
[Clover]: http://openclover.org/
[Web Portal]: https://bitbucket.org/KNIME/knime-webportal

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
It requires the `SONAR_LOGIN` and `SONAR_PASSWORD` environment variables to be set, which must be valid credentials
for the SonarQube instance configured in `sonar-project.properties`.


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

This project can also be built via a maven build wrapper

```sh
mvn clean install
```

## Embedding the PageBuilder in apps

The PageBuilder can be used in Vue/Nuxt apps like a regular Vue component.
In the KNIME WebPortal the built version is loaded during runtime via HTTP.
 
Integrating the source as a Git submodule and building it with the embedding app should also work, but was not tested
yet.

### Requirements

The PageBuilder expects that the embedding app provides the following:

- Vue, Vuex and Consola compatible to the versions defined in [`package.json`](package.json)
- global `window.consola` instance for logging
- CSS variables as defined in the `webapps-common` project.
  They are not included in the build in order to avoid duplication
- calls the method 'initStore' as described in the next section, before PageBuilder store actions and the component are beeing used

### Usage example

For example, in a Nuxt app, the following middleware registers the `PageBuilder` component globally and initializes
the PageBuilder store:

```js
import Vue from 'vue';
import { pagebuilderURL } from '~/app.config';
import actions from '~/pagebuilder-store-api';
import PageBuilderError from '~/components/PageBuilderError';

export default async function ({ app }) {
    if (window['knime-pagebuilder']) {
        return;
    }

    consola.trace(`Loading PageBuilder from ${pagebuilderURL}`);
    try {
        let PageBuilder = await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.async = true;
            script.addEventListener('load', () => {
                let componentConfig = window['knime-pagebuilder'];
                if (componentConfig) {
                    resolve(componentConfig);
                } else {
                    reject(new Error('PageBuilder script invalid'));
                }
            });
            script.addEventListener('error', () => {
                reject(new Error('PageBuilder script loading failed'));
            });
            script.src = pagebuilderURL;
            document.head.appendChild(script);
        });
        PageBuilder.initStore(actions, app.store);
        Vue.component('PageBuilder', PageBuilder);
    } catch (e) {
        consola.error('Loading of PageBuilder failed');
        Vue.component('PageBuilder', PageBuilderError);
    }
}
```
Then the component can be used in templates:

```xml
<template>
    <PageBuilder />
</template>
```

### API
The component provides a store module namespaced as `pagebuilder`. All communication with the embedding app is achieved
via store actions. Therefore, the app must provide well-defined implementations for the actions defined in
[`store/keys.js`](store/keys.js).


#### Outbound (interface)

The following actions are required to be implemented by the embedding application:

##### `nextPage`

Triggers execution of the workflow up to the next page (or to the end, if no more pages are present).

###### Parameters:

(none)

###### Example:

```js
// pagebuilder-api/actions.js
export default {
    nextPage({ commit }) {
        consola.trace('Pagebuilder requested next page');
        this.$api.proceedToNextPage();
    }
    // …
};

```

##### `previousPage`

Triggers rollback of the workflow to the previous page

###### Parameters:

(none)

###### Example:

```js
// pagebuilder-api/actions.js
export default {
    previousPage({ commit }) {
        consola.trace('Pagebuilder requested previous page');
        this.$api.proceedToNextPage();
    }
    // …
};
```


#### Inbound

These actions are implemented by the PageBuilder and can be dispatched by the embedding application:

##### `setPage`

Sets the current page object required to render a page.

###### Parameters:

* `{ page }`  
  Page configuration parameter as provided by the Job API

###### Example:

```js
this.$store.dispatch('pagebuilder/setPage', {
    page: {
        '@class': 'org.knime.js.core.JSONWebNodePage',
        webNodePageConfiguration: { /* … */ },
        webNodes: { /* … */ },
        version: '1.2.3.4'
    }
});
```

##### `pagebuilder/setViewState`

Sets the view state in PageBuilder.

###### Parameters:

* `{ viewState }`  
  Three view states are supported: `page`, `executing`, `result`

    * `page`: The workflow is currently at a view node. The pagebuilder displays the HTML view for that node.  
      Requires a page object (which can be provided by `setPage`; see above).
    * `executing`: Some node in the workflow is currently being executed. The pagebuilder displays a progress view.
    * `result`: The workflow is executed. The pagebuilder displays a success / error summary page.

###### Example:

```js
this.$store.dispatch('pagebuilder/setViewState', { viewState: 'executing' });
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

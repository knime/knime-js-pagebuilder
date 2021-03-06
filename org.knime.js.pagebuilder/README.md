# ![Image](https://www.knime.com/files/knime_logo_github_40x40_4layers.png) PageBuilder for KNIME Analytics Platform & KNIME WebPortal

This repository contains the frontend components of the PageBuilder based on the [Vue] JavaScript framework and is used for layouting and rendering KNIME's JavaScript-based visualizations.
It is built as an [Vue library] and used in KNIME Analytics Platform and KNIME WebPortal.

## Development

### Prerequisites

* Install [Node.js][node], see version in [package.json](package.json).

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


### Launch development server with demo app and mocks
Compiles all JavaScript sources, assets, … and starts a local web server with a demo app for development.
Includes hot-reloading, so code changes will be visible in the browser immediately.

```sh
npm run dev
```
### Development integration with KNIME Analytics Platform

When developing PageBuilder for Analytics Platform run the following command

```sh
npm run dev:ap
```

and follow these steps:
1. add the Java project of this repository to Eclipse
2. start Analytics Platform from Eclipse in debug mode
3. now open a single or composite node view

Please note that currently there is no hot code reloading available, you need to close the view window and reopen it to
see your changes.

### Development integration with KNIME WebPortal

When developing the [WebPortal], a web server with the built version of the library is required. This project provides
this via the command:

```sh
npm run dev:webportal
```

This does not create an app on its own, only the library for usage in [WebPortal] dev mode. It starts a web server,
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
- global `window.Vue` object
- global `window.consola` instance for logging
- CSS variables as defined in the `webapps-common` project.
  They are not included in the build in order to avoid duplication.
- calls the method 'initStore' as described in the next section, before PageBuilder store actions and the component are
  being used

### Usage example

For example, in a Nuxt app, the following middleware registers the `PageBuilder` component globally and initializes
the PageBuilder store:

```js
import Vue from 'vue';
import { pagebuilderURL } from '~/app.config';
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
        PageBuilder.initStore(app.store);
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
The component provides a store module namespaced as `pagebuilder`. Currently, there is only inbound communication, e.g.
the embedding app calls store actions of the PageBuilder.


#### Inbound

These actions are implemented by the PageBuilder and can be dispatched by the embedding application:

##### `pagebuilder/setPage`

Sets the current page object required to render a page.

###### Parameters:

* `{ page }`  
  Page configuration as provided by the Gateway API

###### Example:

```js
this.$store.dispatch('pagebuilder/setPage', {
    page: {
        hasPreviousPage: true,
        nodeMessages: {},
        wizardExecutionState: 'INTERACTION_REQUIRED',
        wizardPageContent: {
            '@class': 'org.knime.js.core.JSONWebNodePage',
            webNodePageConfiguration: { /* … */ },
            webNodes: { /* … */ },
            version: '1.2.3.4'
        }
    }
});
```

##### `pagebuilder/setResourceBaseUrl`

Provide the base URL for resources that get injected into iframes.

Since the pagebuilder can run under different root URLs it needs to know the baseURL. This will be concatenated with the
resource paths of the JS views’ `javascriptLibraries` and `stylesheets` items. 

###### Parameters:

* `{ resourceBaseUrl }`  
  Should be an absolute URL.

###### Example:

```js
this.$store.dispatch('pagebuilder/setResourceBaseUrl', {
    resourceBaseUrl: 'https://knime.example/knime/webportal/rest/v4/get-resources-dummypath'
});
```

##### `pagebuilder/getViewValues`

Gets all values of the views (iframes or widgets) on the current page.

###### Parameters:

none

###### Example:

```js
let viewValues = await this.$store.dispatch('pagebuilder/getViewValues');
```

# Join the Community!
* [KNIME Forum](https://forum.knime.com/)


[Vue]: https://vuejs.org/
[node]: https://knime-com.atlassian.net/wiki/spaces/SPECS/pages/905281540/Node.js+Installation
[Java]: https://www.oracle.com/technetwork/java/javase/downloads/index.html
[Vue CLI docs]: https://cli.vuejs.org/guide/
[Vue library]: https://cli.vuejs.org/guide/build-targets.html#library
[Nightwatch.js]: http://nightwatchjs.org/
[jest]: https://jestjs.io/en
[LCOV]: https://github.com/linux-test-project/lcov
[Clover]: http://openclover.org/
[WebPortal]: https://bitbucket.org/KNIME/knime-webportal

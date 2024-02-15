# ![Image](https://www.knime.com/sites/default/files/knime_logo_github_40x40_4layers.png) PageBuilder for KNIME Analytics Platform & KNIME Data Apps

This repository contains the frontend components of the PageBuilder based on the [Vue] JavaScript framework and is used for layouting and rendering KNIME's JavaScript-based visualizations.

It has two build outputs:

- regular Vue app which is used in KNIME Analytics Platform
- [Vue library] which is used in KNIME Analytics Platform Modern UI and KNIME Data Apps running in Hub Execution Webapp

## Development

### Prerequisites

- Install [Node.js][node], see version in [package.json](package.json).

Pull the contained [git submodules](https://stackoverflow.com/a/4438292/5134084) with

```sh
git submodule update --init
```

### Install dependencies

```sh
npm i
```

and then use the following commands.

### Launch development server

```sh
npm run dev
```

#### Development with mocked pages

Browse to the dev server URL provided by the command above to get a standalone development environment with mocked pages (see [/mocks](/mocks) directory).

#### Development integration with KNIME Analytics Platform (classic UI)

1. add the Java project of this repository to Eclipse
2. add following to the run configuration in Eclipse

```
-Dorg.knime.ui.dev.pagebuilder.url=http://localhost:5173/apWrapper.html
-Dchromium.remote_debugging_port=8888
```

4. start Analytics Platform from Eclipse
5. now open a single or composite node view

<!---
### Development integration with KNIME WebPortal

When developing the [WebPortal], a web server with the built version of the library is required. This project provides
this via the command:

```sh
npm run dev:webportal
```

This does not create an app on its own, only the library for usage in [WebPortal] dev mode. It starts a web server,
and re-builds the library on source file change. The web portal page then needs to be manually refreshed.
-->

### Git hooks

When committing your changes, a couple of commit hooks will run via [husky].

- `pre-commit` hook to lint and format the changes in your stage zone (via [lintstaged])
- `prepare-commit-msg` hook to format your commit message to conform with the required format by KNIME. In order for this to work you must set environment variables with your Atlassian email and API token. Refer to `@knime/eslint-config/scripts/README.md` for more information.

### Testing

#### Running unit tests

This project contains unit tests written with [vitest].
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

```sh
npm run audit
```

## Building

The following command builds two outputs, the Vue app and also [Vue library] which both are saved to `/dist`.

```sh
npm run build
```

This project can also be built via a maven build wrapper

```sh
mvn clean install
```

## Embedding the PageBuilder in apps

The PageBuilder can be used in Vue/Nuxt apps like a regular Vue component.
In the KNIME WebPortal the built version is loaded during runtime via HTTP.

Integrating the source as a Git submodule and building it with the embedding app also works.

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
import Vue from "vue";
import { pagebuilderURL } from "~/app.config";
import PageBuilderError from "~/components/PageBuilderError";

export default async function ({ app }) {
  if (window["knime-pagebuilder"]) {
    return;
  }

  consola.trace(`Loading PageBuilder from ${pagebuilderURL}`);
  try {
    let PageBuilder = await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.async = true;
      script.addEventListener("load", () => {
        let componentConfig = window["knime-pagebuilder"];
        if (componentConfig) {
          resolve(componentConfig);
        } else {
          reject(new Error("PageBuilder script invalid"));
        }
      });
      script.addEventListener("error", () => {
        reject(new Error("PageBuilder script loading failed"));
      });
      script.src = pagebuilderURL;
      document.head.appendChild(script);
    });
    PageBuilder.initStore(app.store);
    Vue.component("PageBuilder", PageBuilder);
  } catch (e) {
    consola.error("Loading of PageBuilder failed");
    Vue.component("PageBuilder", PageBuilderError);
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

- `{ page }`
  Page configuration as provided by the Gateway API

###### Example:

```js
this.$store.dispatch("pagebuilder/setPage", {
  page: {
    hasPreviousPage: true,
    nodeMessages: {},
    wizardExecutionState: "INTERACTION_REQUIRED",
    wizardPageContent: {
      "@class": "org.knime.js.core.JSONWebNodePage",
      webNodePageConfiguration: {
        /* … */
      },
      webNodes: {
        /* … */
      },
      version: "1.2.3.4",
    },
  },
});
```

##### `pagebuilder/setResourceBaseUrl`

Provide the base URL for resources that get injected into iframes.

Since the pagebuilder can run under different root URLs it needs to know the baseURL. This will be concatenated with the
resource paths of the JS views’ `javascriptLibraries` and `stylesheets` items.

###### Parameters:

- `{ resourceBaseUrl }`
  Should be an absolute URL.

###### Example:

```js
this.$store.dispatch("pagebuilder/setResourceBaseUrl", {
  resourceBaseUrl:
    "https://knime.example/knime/webportal/rest/v4/get-resources-dummypath",
});
```

##### `pagebuilder/getViewValues`

Gets all values of the views (iframes or widgets) on the current page.

###### Parameters:

none

###### Example:

```js
let viewValues = await this.$store.dispatch("pagebuilder/getViewValues");
```

# Join the Community!

- [KNIME Forum](https://forum.knime.com/)

[Vue]: https://vuejs.org/
[node]: https://knime-com.atlassian.net/wiki/spaces/SPECS/pages/905281540/Node.js+Installation
[Vue library]: https://vitejs.dev/guide/build.html#library-mode
[vite]: https://vitest.dev/
[LCOV]: https://github.com/linux-test-project/lcov
[Clover]: http://openclover.org/
[husky]: https://www.npmjs.com/package/husky
[lintstaged]: https://github.com/okonet/lint-staged

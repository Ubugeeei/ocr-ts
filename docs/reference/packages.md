# Packages

Tecack consists of **5** packages.

## Packages Overview

### @tecack/frontend

The frontend of tecack generates stroke data for tecack from a canvas.
The drawing on the canvas and the event handling functions are implemented in this package.  
For more details, please refer to the [API Reference](/reference/apis).

### @tecack/backend

The backend of tecack takes stroke data and datasets from tecack and implements an algorithm to infer character candidates.  
For more details, please refer to the [API Reference](/reference/apis).

### @tecack/dataset

Provides datasets used in the backend.
This is a set of default datasets prepared for the tecack package,
and users can also create their own datasets.  
For information on [Creating Datasets](/reference/stroke-data).

### @tecack/shared

A shared package.
It includes type definitions representing stroke information and encoders/decoders for reducing payload size.  
For more details, please refer to the [API Reference](/reference/apis).

### @tecack/tools

A set of tools for developers.
It is used by developers to create their own datasets for individual projects.  
For more details, please refer to [Tools Reference](/tools/j-tegaki).

## Installation

Each package can be installed individually.

::: code-group

<<< @/snipets/installation-pkg/npm
<<< @/snipets/installation-pkg/pnpm
<<< @/snipets/installation-pkg/yarn
<<< @/snipets/installation-pkg/bun

:::

When installed as `tecack`, all packages excluding tools will be installed.

::: code-group

<<< @/snipets/installation/npm
<<< @/snipets/installation/pnpm
<<< @/snipets/installation/yarn
<<< @/snipets/installation/bun

:::

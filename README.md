# Aditify

Aditify is the open-source shared administration UI and identity toolkit used by Aditi products. It is maintained independently and included in product repositories as the `Packages/Aditify` Git submodule.

## Packages

- `@aditify/ui`: Vue 3 administration components, design tokens, and compiled styles.
- `@aditify/identity`: Vue identity screens, the transport-independent `IdentityApi` contract, and a configurable REST client.
- `@aditify/catalog`: Private component documentation and interactive examples for the public UI package.
- `Aditify.Identity.AspNetCore`: ASP.NET Core identity services and configurable minimal API endpoints.

## Development

Install all JavaScript dependencies from this directory:

```sh
yarn install
```

Run the shared checks with `yarn lint`, `yarn type-check`, `yarn test`, and `yarn build`.

Run the component catalog with `yarn dev:catalog`, or create its static build with `yarn build:catalog`. The catalog consumes the built public `@aditify/ui` package and is never published to npm.

The identity integration and HTTP contract are documented in [Identity/README.md](Identity/README.md). The ASP.NET Core setup is documented in [Identity.AspNetCore/README.md](Identity.AspNetCore/README.md).

## Publishing

Maintainers publish versioned packages through the repository workflow. Release credentials and registry policy belong in the hosting platform's protected settings and must never be committed or documented here. Keep the npm and NuGet contract versions aligned when a release changes identity request or response shapes.

## License

Aditify is licensed under the [Apache License 2.0](LICENSE).

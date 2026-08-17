# Vertical Ecosystem Lifecycle

The Vertical Factory now has a provider-neutral contract for making a vertical a first-class member of the logged-in ecosystem.

## Lifecycle

`registered → building → preview → verified → production`

A disabled vertical may move to `disabled` and is removed from the active launcher without deleting its historical lifecycle events.

## Registration

A generated vertical emits `VERTICAL_REGISTERED` with:

- stable vertical ID/slug
- name and description
- capabilities
- account requirement
- mailing capability
- theme
- production launch URL
- repository metadata

The logged-in ecosystem consumes the catalog rather than maintaining a hardcoded list of vertical routes.

## Deployment

Each vertical gets a Cloudflare Pages deployment manifest declaring:

- production Pages project
- production `.pages.dev` URL
- preview URL pattern
- automatic deployment on `main`
- automatic preview deployment for pull requests
- health-check path

The Platform defines this contract; the actual Cloudflare credentials and deployment implementation remain in the deployment environment/repository.

## User experience

Once a vertical reaches `verified` or `production`, the ecosystem launcher can expose it automatically. The launcher should display the catalog metadata and lifecycle/deployment status rather than embedding vertical-specific routing logic.

## Critical boundary

The original `mycomind4-arch/mailmypdf` repository is **not** part of this automatic visual/deployment migration. It remains the canonical production MailMyPDF application and is explicitly excluded from vertical-factory deployment automation.

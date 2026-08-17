# GitHub App manifest / permissions

The production GitHub App should request the minimum permissions needed for the installed capabilities.

## Initial permissions

- Metadata: read
- Contents: read
- Pull requests: read/write when PR remediation is enabled
- Issues: read/write when issue reporting is enabled
- Checks: read for CI diagnosis
- Actions: read for CI diagnosis

## Events

- installation
- installation_repositories
- push
- pull_request
- pull_request_review
- workflow_run
- issues
- issue_comment

## Installation policy

Default installation should be limited to selected repositories rather than all repositories.

The app should not request administration, secrets, members, or organization-owner permissions unless a later capability has a documented requirement and explicit security review.

## Production registration

Register the App in GitHub Developer Settings, configure the webhook URL and secret, generate the private key, and store the private key/webhook secret only in the server-side secret manager. Do not commit either credential to the repository.

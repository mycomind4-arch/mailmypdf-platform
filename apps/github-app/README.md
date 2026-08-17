# MailMyPDF Platform GitHub App

The Platform GitHub App is the repository-facing control plane for Platform intelligence.

## Initial responsibilities

- receive GitHub webhook events
- authenticate webhook requests
- resolve installation/repository context
- inspect repository metadata through GitHub's API
- expose Platform audit/integration jobs
- create issues and pull requests only through explicit, auditable actions
- keep repository credentials and installation tokens server-side

## Security model

The app must never expose GitHub installation tokens, private keys, webhook secrets, or provider credentials to browser clients.

Repository operations are scoped to the GitHub App installation and repository received in the webhook/API context. Consequential actions such as pushing code, creating PRs, merging PRs, or changing repository settings require explicit authorization.

## Planned capabilities

1. Repository architecture audit
2. Platform compatibility audit
3. Platform capability discovery
4. PR review
5. Security/persistence review
6. Migration planning
7. Safe patch/PR generation
8. CI/deployment diagnosis
9. Platform drift detection

External AI and GitHub provider runtimes must operate through Platform contracts and tools; they must not receive arbitrary persistence access.

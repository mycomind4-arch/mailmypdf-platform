# @mailmypdf/browser-intelligence

Provider-neutral browser automation contracts for the Platform.

This package intentionally contains **no browser runtime dependency**. Adapters for agent-browser, browser-use, or another implementation must live outside the core contract and enforce the supplied policy before executing actions.

The boundary exists so browser automation can later support research, evidence collection, portal navigation, and agent workflows without coupling the Platform domain to a browser framework.

## Safety

- HTTPS only
- explicit domain allowlist
- private/local hosts blocked
- bounded action budget
- bounded session lifetime
- downloads must be separately controlled by an adapter
- consequential actions require approval according to policy
- evidence carries session and adapter provenance

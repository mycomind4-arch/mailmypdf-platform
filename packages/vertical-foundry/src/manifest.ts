export interface VerticalManifest { id: string; name: string; domain: string; repository: string; excludedRepositories: string[] }

export function validateManifest(manifest: VerticalManifest, originalRepository = 'mycomind4-arch/mailmypdf'): void {
  if (!manifest.id || !manifest.domain || !manifest.repository) throw new Error('Incomplete vertical manifest')
  if (manifest.repository === originalRepository || manifest.excludedRepositories.includes(originalRepository)) {
    throw new Error('Original MailMyPDF repository is outside autonomous vertical scope')
  }
}

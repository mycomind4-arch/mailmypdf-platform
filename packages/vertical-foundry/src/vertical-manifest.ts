export interface VerticalManifest {
  id: string
  name: string
  domain: string
  repository: string
  branch: string
  capabilities: string[]
  generatedAt: string
}

export function createManifest(input: Omit<VerticalManifest, 'generatedAt'>): VerticalManifest {
  return { ...input, generatedAt: new Date().toISOString() }
}

export function validateManifest(manifest: VerticalManifest): void {
  if (!manifest.id || !manifest.name || !manifest.domain || !manifest.repository || !manifest.branch) throw new Error('Invalid vertical manifest')
  if (manifest.domain === 'mailmypdf.com' || manifest.repository.includes('/mailmypdf')) throw new Error('Original MailMyPDF must remain outside autonomous vertical migration')
}

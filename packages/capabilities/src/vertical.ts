import type { AgentCapability } from './agent';
export type VerticalManifest={id:string;name:string;version:string;capabilities:AgentCapability[];workflows:string[];languages?:string[];mailEnabled?:boolean};
export function validateVertical(manifest:VerticalManifest):string[]{const errors:string[]=[];if(!manifest.id)errors.push('missing id');if(!manifest.name)errors.push('missing name');if(!manifest.version)errors.push('missing version');if(!manifest.workflows.length)errors.push('no workflows');return errors;}

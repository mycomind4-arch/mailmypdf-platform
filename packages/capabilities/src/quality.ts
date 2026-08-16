export type QualityDimension={id:string;label:string;score:number;status:'pass'|'warning'|'fail';reason:string};
export type QualityReport={score:number;dimensions:QualityDimension[];generatedAt:string};
export function aggregateQuality(dimensions:QualityDimension[]):QualityReport{const score=dimensions.length?Math.round(dimensions.reduce((s,d)=>s+d.score,0)/dimensions.length):0;return{score,dimensions,generatedAt:new Date().toISOString()};}

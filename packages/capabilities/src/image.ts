export type ImageQuality={width:number;height:number;blurScore?:number;glareScore?:number;orientation:'portrait'|'landscape'|'unknown'};
export type ImagePreprocessor={preprocess(input:Uint8Array):Promise<{data:Uint8Array;quality:ImageQuality}>};
export function needsCaptureRetry(q:ImageQuality):boolean{return q.width<1000||q.height<1000||(q.blurScore!==undefined&&q.blurScore<0.25)||(q.glareScore!==undefined&&q.glareScore>0.8);}

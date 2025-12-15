export function pixelsToComplex(clientX,clientY,span,dim,origon){
    

    let x = span*(2*clientX-dim)/dim;
    x += origon[0]
    let y = span*(dim-2*clientY)/dim;
    y+=origon[1];

    return [x.toFixed(3),y.toFixed(3)];
}

export function complexToPixels(x,y,span,dim,origon){
    x -= origon[0];
    y -= origon[1];
    
    let px = (dim/2)*(x/span + 1);
    let py = ((y-span)*dim)/(-2*span);
    return [parseInt(px),parseInt(py)];
}
export function NScomplexToPixels(x,y,span,dim){
    let px = (dim/2)*(x/span + 1);
    let py = ((y-span)*dim)/(-2*span);
    return [parseInt(px),parseInt(py)];
}
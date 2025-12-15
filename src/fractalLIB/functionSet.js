
let fSet = {
    0 : function mandlebrot(z){
        let real = z.real
        z.real = real**2 - z.img**2
        z.img = 2*real*z.img
        

    },
    1 : function modular(z){
        let real = z.real
        z.real = Math.sin(real**2 * real**5) % 23
        z.img = 2*(real*z.img)

    },

    2: function cosine(z){
        let real = z.real
        z.real =Math.cos(2* real**2 +z.img**2)
        z.img = Math.E**Math.sin(z.img * z.real)
    }
    ,
    3: function toad(z){
        let real = z.real
        z.real = Math.sin(13*real);
        if(real < 0){
            real *=-1
            
        }
    }
}

export default function selectFunction(idx){
    return fSet[idx];
}





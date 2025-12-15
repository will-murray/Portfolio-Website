class ColoringFunctionManager{
    //Allows coloring functions to be selected and inverted

    constructor(){

      
        this.coloringFunctions = {
            0 : function Watermelon(t){
                return [
                    parseInt(t*6),
                    parseInt(100*Math.abs(Math.cos((6*t)))),
                    parseInt((t*2))
                ]


            },

            1 : function shart(t){
                return [
                    parseInt(Math.abs(100*Math.sin(50*t))),
                    parseInt(Math.abs(100*Math.cos(10*t))),
                    parseInt(Math.abs(50*Math.sin(10*t)))


                ]
            },

            2: function foo(t){
                return [
                    10*parseInt(t*Math.abs(Math.sin(3*t) + Math.cos(4*t))) + 20,
                    10*parseInt(t*Math.abs(Math.sin(3*t) + Math.cos(4*t)))+ 100,
                    parseInt(6*t) + 100
                ]
            },

            3: function bar(t){
                return[
                12*parseInt((t % 5)),
                25*parseInt(Math.abs(15*(Math.cos(10*(t % 11))))),
                21*parseInt((t%7))
                ]

            }
            }

        this.inversion_state = 0
        this.function_state = 0
        this.current_funs = this.coloringFunctions[this.function_state]
        this.num_coloring_functions = Object.keys(this.coloringFunctions).length

    }


    next_color(){
        this.function_state = (this.function_state + 1) % this.num_coloring_functions
        this.current_funs = this.coloringFunctions[this.function_state]
    }
    
    invert_coloring_function(){
        this.inversion_state = (this.inversion_state + 1) % 3
    }

    eval(t){
        let C =  this.current_funs(t)
        return [C[this.inversion_state], C[(this.inversion_state + 1 )% 3], C[(this.inversion_state + 2 )% 3]]
    }



}


export {ColoringFunctionManager};

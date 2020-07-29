// functions related to initializing fm

var fm = function(){

    var init = function(){
        
        paper.setup('paperCanvas');

        fm.document.setup();

        //fm.config();

        console.log('FileMap setup is initialized...')
    }

    return {
        init: init
    };

}(); // Adding the () to the end calls the function that was just created.


// set fm up on window load
jQuery(window).load(function() {
    fm.init();
    
});


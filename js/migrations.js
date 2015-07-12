var Migrations = {
    "0.2.1": function() {
        console.log("Start migration to data version 0.3.0");

        AppStorage.getAll(function(data){
            var typeCounts = {};

            AppStorage.options.version = "0.3.0";

            for(el in data) {
                if(data.hasOwnProperty(el)) {
                    if(typeof typeCounts[data[el].type] == "undefined") {
                        typeCounts[data[el].type] = 0;
                    }

                    data[el].position = typeCounts[data[el].type];

                    AppStorage.set(data[el]);

                    typeCounts[data[el].type]++;
                }
            }
        });
    }
};
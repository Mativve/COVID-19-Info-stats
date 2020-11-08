(function(){

    function numberWithSpaces(x) {
        if( x ){
            return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
        }
        else{
            return 0;
        }
    }

    // 
    // Apply data
    // 
    async function apply_data(a){
        let { last_cases, compare_cases, last_deaths, compare_deaths, last_recovered, compare_recovered, data, type } = a;
        let cases_html = (compare_cases) ? `${numberWithSpaces(last_cases)} <small>(+${compare_cases})</small>` : `${numberWithSpaces(last_cases)}`;
        let deaths_html = (compare_cases) ?  `${numberWithSpaces(last_deaths)} <small>(+${compare_deaths})</small>` :  `${numberWithSpaces(last_deaths)}`;
        let recovered_html = (compare_cases) ? `${numberWithSpaces(last_recovered)} <small>(+${compare_recovered})</small>` : `${numberWithSpaces(last_recovered)}`;
        
        document.getElementById("infected").innerHTML = cases_html;
        document.getElementById("deaths").innerHTML =deaths_html;
        document.getElementById("recovered").innerHTML = recovered_html;

        // Get country name
        if( type == "country" ){
            await fetch("https://covid19-api.org/api/country/" + data[0].country)
            .then(response => response.json())
            .then(country => {
                document.getElementById('country_name').innerHTML = country.name;
                return_flag_url( country.alpha2, function(img){
                    document.getElementById('country_flag').setAttribute("src", img);
                }, true);
            });
        }
        else{
            document.getElementById('country_name').innerHTML = "Global statistics";
            document.getElementById('country_flag').parentNode.remove();
        }

        // Chart js
        let timeline, days;
        timeline = data.map((el) => {
            return {
                date: el.last_update,
                cases: (el.total_cases) ? el.total_cases : (el.cases) ? el.cases : false,
                deaths: (el.total_deaths) ? el.total_deaths : (el.deaths) ? el.deaths : false,
                recovered: (el.total_recovered) ? el.total_recovered : (el.recovered) ? el.recovered : false
            };
        });

        days = data.map((el) => {
            let d = new Date(el.last_update);
            return d.toLocaleDateString('en-US', date_short_options);
        });

        // Ustaw wykres
        let latest = {
            "confirmed":[],
            "deaths":[],
            "recovered":[],
            "days": days
        };

        timeline.forEach(function(el){
            latest.confirmed.push(el.cases);
            latest.deaths.push(el.deaths);
            latest.recovered.push(el.recovered);
        });

        set_chart(latest, {size:"small"});
    }

    async function get_data(pa){
        let url = "";

        let output;

        switch( pa.type ){
            case "global":{
                url = "https://covid19-api.org/api/timeline";
                break;
            }
            case "country":{
                url = "https://covid19-api.org/api/timeline/" + pa.slug;
                break;
            }
        }

        await fetch(url)
        .then(response => response.json())
        .then(data => {

            // Compare cases
            let compare_cases_1 = (data[0].total_cases) ? data[0].total_cases : (data[0].cases) ? data[0].cases : false;
            let compare_cases_2 = (data[1].total_cases) ? data[1].total_cases : (data[1].cases) ? data[1].cases : false;
            let compare_cases = compare_cases_1 - compare_cases_2;

            // Compare deaths
            let compare_deaths_1 = (data[0].total_deaths) ? data[0].total_deaths : (data[0].deaths) ? data[0].deaths : false;
            let compare_deaths_2 = (data[1].total_deaths) ? data[1].total_deaths : (data[1].deaths) ? data[1].deaths : false;
            let compare_deaths = compare_deaths_1 - compare_deaths_2;

            // Compare recovered
            let compare_recovered_1 = (data[0].total_recovered) ? data[0].total_recovered : (data[0].recovered) ? data[0].recovered : false;
            let compare_recovered_2 = (data[1].total_recovered) ? data[1].total_recovered : (data[1].recovered) ? data[1].recovered : false;
            let compare_recovered = compare_recovered_1 - compare_recovered_2;

            // Reverse
            data.reverse();

            output = {
                "type":pa.type,
                "last_cases":compare_cases_1,
                "compare_cases":compare_cases,
                "last_deaths":compare_deaths_1,
                "compare_deaths":compare_deaths,
                "last_recovered":compare_recovered_1,
                "compare_recovered":compare_recovered,
                "data":data
            };

            apply_data(output);
        });
    }

    function init(){
        let params = get_params();

        if( params.type ){
            get_data(params);
        }
    }
    init();

})();
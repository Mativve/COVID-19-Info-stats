// 
// Search input
// 
const search = document.getElementById("city_search");
let country_dropdown = document.getElementById("city_search_list");

function find_country(value){
    value = value.toLowerCase();

    if(  country_dropdown !== document.getElementById("city_search_list") ){ country_dropdown = document.getElementById("city_search_list"); }

    if( value.length > 0 ){
        set_country_list(value.toLowerCase());
    }
    else{
        country_dropdown.querySelectorAll("li a").forEach(function(el){
            el.parentNode.classList.remove("hide");
        });
    }
}
if( search ){
    search.addEventListener('keyup', function(e){
        let value = e.target.value;

        if( value.length > 1 ){ country_dropdown.classList.add("show"); }
        else{ country_dropdown.classList.remove("show"); }

        find_country( value );
    });
}


// 
// Set single country stats (single country page)
// 
const single_country = document.getElementById("single-country");
const single_country_additional = document.getElementById("single-country-additional");
const single_country_additional_source = document.getElementById("single-country-additional-source");
const single_country_additional_update = document.getElementById("single-country-additional-update");
const country_name = document.getElementById("country_name");
const country_flag = document.getElementById("country_flag");
const country_date = document.getElementById("country_date");
const country_infected = document.getElementById("country_infected");
const country_deaths = document.getElementById("country_deaths");
const country_recovered = document.getElementById("country_recovered");
const map = document.getElementById("map");
const locations = map.querySelectorAll(`[data-countryid]`);

async function set_single_country_stats(slug){
    single_country.classList.add("reload");

    let timeline, days;
    let last_update;

    const {cases, deaths, recovered, new_cases, new_deaths, new_recovered, code, name} = STATS.countries.find((el) => { return (el.code == slug); });

    await fetch(site_url+`?type=timeline&country=${slug}`)
    .then(response => response.json())
    .then(data => {
        last_update = data[0].last_update;

        data.reverse();

        timeline = data.map(({last_update, cases, deaths, recovered}) => {
            return {date:last_update, cases:cases, deaths:deaths, recovered:recovered};
        });

        days = data.map(({last_update}) => {
            let d = new Date(last_update);
            return d.toLocaleDateString(get_locale(), date_short_options);
        });
        
        // Add today
        let today = new Date();
        days.push( today.toLocaleDateString(get_locale(), date_short_options) );

        if( days.length ){
            days.forEach((el, i) => {
                if( el ){
                    let d = el.split(/[\.|\,|\/]/g);
                    days[i] = `${d[1]}/${d[0]}/${d[2]}`;
                }
            });
            // console.log(days);
        }
    });

    // Ustawienie danych (nazwa, flaga)
    country_name.innerText = (name) ? get_country(code) : "N/D";
    country_name.setAttribute("data-lang", slug);
    country_name.setAttribute("data-lang-target", "country");

    let date = new Date(last_update);

    country_date.innerText = (last_update) ? date.toLocaleDateString(get_locale(), date_options) : "N/D";
    country_flag.setAttribute("src", return_flag_url(code, null, false));

    // Obecne statystyki
    update_data_counter("country_infected", cases);
    update_data_counter("country_deaths", deaths);
    update_data_counter("country_recovered", recovered);
    update_data_counter("country_infected_today", new_cases);
    update_data_counter("country_deaths_today", new_deaths);
    update_data_counter("country_recovered_today", new_recovered);

    // Sprawdzenie i wyświetlenie dodatkowych statystyk
    await fetch(`${site_url}?type=additionalexist&country=${slug}`)
    .then(response => response.json())
    .then(({exist, source}) => {
        single_country_additional.classList.toggle("d-none", !exist);

        if( exist ){
            single_country_additional_source.innerHTML = source;
        }

        return exist;
    }).then(async (exist) => {
        if( exist ){
            await fetch(`${site_url}?type=additional&country=${slug}`)
            .then(response => response.json())
            .then((data) => {
                
                single_country_additional_update.innerHTML = data.update;

                data.update = false;

                Object.keys(data).forEach((el) => {
                    if( data[el] ){
                        update_data_counter(el, data[el]);
                    }
                });
            });
        }
    });

    // Podjaśnienie mapki
    locations.forEach(function(el){
        let check = (el.dataset.countryid == code || el.dataset.countryid.includes(name) || el.getAttribute("aria-label").includes(name));

        if( check ){
            el.classList.add("selected");

            el.parentNode.appendChild(el);
        }
        else{
            el.classList.remove("selected");
        }
    });

    let location_exist = (map.querySelectorAll('.selected').length > 0);
    map.classList.toggle("empty", !location_exist);
    if( !location_exist ){ document.getElementById("map_redirect").setAttribute("href", `https://www.google.com/maps/place/Country ${name}`); }
    else{ zoom_to_country( document.querySelector('#map .map-inner svg .selected') ); }

    // Ustaw wykres
    let latest = {
        "confirmed":[],
        "daily_confirmed":[],
        "deaths":[],
        "daily_deaths":[],
        "recovered":[],
        "daily_recovered":[],
        "days": days
    };

    timeline.forEach(function({cases, deaths, recovered}, i){
        latest.confirmed.push(cases);
        latest.deaths.push(deaths);
        latest.recovered.push(recovered);
    });

    latest.confirmed.reduce(function(result, item){
        latest.daily_confirmed.push( item - result );
        return item;
    });

    latest.deaths.reduce(function(result, item){
        latest.daily_deaths.push( item - result );
        return item;
    });

    latest.recovered.reduce(function(result, item){
        latest.daily_recovered.push( item - result );
        return item;
    });


    // Percentage
    let percentage = {
        "confirmed":[],
        "deaths":[],
        "recovered":[],
        "days": days
    };
    latest.daily_confirmed.forEach((el, i) => {
        let mx = latest.daily_confirmed[i] + latest.daily_deaths[i] + latest.daily_recovered[i];

        percentage.confirmed.push( ((latest.daily_confirmed[i] / mx) * 100).toFixed(2) );
        percentage.deaths.push( ((latest.daily_deaths[i] / mx) * 100).toFixed(2) );
        percentage.recovered.push( ((latest.daily_recovered[i] / mx) * 100).toFixed(2) );
    });

    percentage.confirmed.pop();
    percentage.deaths.pop();
    percentage.recovered.pop();
    percentage.days.pop();

    set_chart("daily", latest, {type:'bar'});
    set_chart("daily_percentage", percentage, {type:'bar', stacked: true});
    set_chart("country_chart", latest, {type:'LineWithLine'});

    single_country.classList.remove("reload");

    update_countup();
}


// 
// Set global stats
// 
function set_global_stats(stats){
    let {cases, deaths, recovered} = stats;

    update_data_counter("global_infected", cases);
    update_data_counter("global_deaths", deaths);
    update_data_counter("global_recovered", recovered);
}

// 
// Set most and least infected countries
// 
function set_most_least_infected_table(stats){
    let top_max = get_top_max_by_prop(stats, "cases", 7);
    let top_min = get_top_min_by_prop(stats, "cases", 7, false);

    apply_data_to_table({
        id: "most_infected_country_table",
        stats: top_max,
        random: false
    });

    apply_data_to_table({
        id: "least_infected_country_table",
        stats: top_min,
        random: false
    });
}

// 
// Set country list (random)
// 
function set_country_list(query){
    let country_list = document.getElementById("city_search_list");
    let html = "";

    let founded = STATS.countries.filter((el) => {
        return ( el.name.toLowerCase().includes(query) );
    });

    founded.forEach(function(el){
        let {code, name} = el;
        if( code.toLowerCase() != "dp" ){
            html += `<li class="input-dropdown-item"><a href="#" data-set-view="country" data-params='{"slug":"${code}"}' data-value="${code} ${ get_country(code) }" class="input-dropdown-button" z-index="1"><img src="${return_flag_url(code.toLowerCase())}"/> ${ get_country(code) }</a></li>`;
        }
    });

    country_list.innerHTML = html;

    update_set_view_triggers();

    country_list.querySelectorAll("a").forEach(function(el){
        el.addEventListener('click', function(e){
            if( country_list.classList.contains("show") ){
                country_list.classList.remove("show");
                country_list.previousElementSibling.value = "";
            }
        });
    });
}

// 
// All country list
// 
let acl_page = 1;
let acl_prev = document.querySelectorAll('[data-prev="infected-list"]');
let acl_next = document.querySelectorAll('[data-next="infected-list"]');
let acl_paged = document.querySelectorAll('[data-paged="infected-list"]');

function acl_set_paginate(){
    // console.log("acl paginate", acl_page);

    let paginated = paginate_array({
        page: acl_page,
        per_page: 14,
        items: STATS.countries,
    });

    acl_prev.forEach(function(el){
        if( paginated.prev ){ el.removeAttribute("disabled"); }
        else{ el.setAttribute("disabled", "disabled"); }
    });

    acl_next.forEach(function(el){
        if( paginated.next ){ el.removeAttribute("disabled"); }
        else{ el.setAttribute("disabled", "disabled"); }
    });

    acl_paged.forEach(function(el){
        el.innerHTML = paginated.counter;
    });

    apply_data_to_table({
        id: "infected-list",
        stats: paginated.items,
        random: false,
        clear: true
    });

    update_set_view_triggers();
}
acl_prev.forEach(function(el){ el.addEventListener('click', function(e){ acl_page--; acl_set_paginate(); }); });
acl_next.forEach(function(el){ el.addEventListener('click', function(e){ acl_page++; acl_set_paginate(); }); });

// 
// Initial function to set data
// 
function set_data(){
    set_global_stats(STATS.global);

    set_most_least_infected_table(STATS.countries);

    apply_data_to_table({
        id: "infected-list",
        stats: STATS.countries,
        random: false
    });

    // Infected list pagination
    acl_set_paginate();

    // set_country_list();

    update_set_view_triggers();
    update_widget_triggers();

    update_countup();

    set_view();
}

// 
// Initial function to get stats from API
// 
async function init_stats(){
    let rng = randid("v");
    let countries = null;
    let global = null;
    let diffs = null;
    let global_stats = {cases:0,deaths:0,recovered:0};

    await fetch("./js/countries.json")
    .then(response => response.json())
    .then(data => {
        countries = data;
    })
    .catch(err => console.error("JSON ERROR: countries |", err));


    await fetch(`${site_url}?type=status`)
    .then(response => response.json())
    .then(data => {
        global = data;
    })
    .catch(err => console.error("[API ERROR]: init_stats global |", err));


    await fetch(`${site_url}?type=diff`)
    .then(response => response.json())
    .then(data => {
        diffs = data;
    })
    .catch(err => console.error("[API ERROR]: init_stats diffs |", err));


    // Join all data to one
    let info = Object.keys(countries).map(function(code){
        let name = countries[code];
        let g = global.find(el => { return (code == el.country); });
        let d = diffs.find(el => { return (code == el.country); });

        if( name && g && d ){
            global_stats.cases += g.cases;
            global_stats.deaths += g.deaths;
            global_stats.recovered += g.recovered;

            return {
                "name": name,
                "code": code,
                "cases": g.cases,
                "new_cases": d.new_cases,
                "deaths": g.deaths,
                "new_deaths": d.new_deaths,
                "recovered": g.recovered,
                "new_recovered": d.new_recovered,
            };
        }
        else{
            return false;
        }
    });

    info = info.filter(el => { return (el != false); });

    // console.log( info );

    return {
        countries: info,
        global: global_stats
    };
}

let stats = init_stats();
stats.then(data => {
    STATS = data;

    // console.log(STATS);
    
    set_data();
})
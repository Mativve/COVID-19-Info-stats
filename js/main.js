// 
// Search input
// 
let search = document.getElementById("city_search");
let country_dropdown = document.getElementById("city_search_list");

function find_country(value){
    value = value.toLowerCase();

    if(  country_dropdown !== document.getElementById("city_search_list") ){ country_dropdown = document.getElementById("city_search_list"); }

    if( value.length > 0 ){
        country_dropdown.querySelectorAll("li a").forEach(function(el){
            let query = el.dataset.value;
            query = query.toLowerCase();
   
            if( query.includes(value)  ){
                el.parentNode.classList.remove("hide");
                el.removeAttribute("tabindex");
            }
            else{
                el.parentNode.classList.add("hide");
                el.setAttribute("tabindex", -1);
            }
        });
    }
    else{
        country_dropdown.querySelectorAll("li a").forEach(function(el){
            el.parentNode.classList.remove("hide");
        });
    }
}
if( search ){
    search.addEventListener('input', function(e){
        let value = e.target.value;

        if( value.length > 1 ){ country_dropdown.classList.add("show"); }
        else{ country_dropdown.classList.remove("show"); }

        find_country( value );
    });
}


// 
// Set single country stats (single country page)
// 
let single_country = document.getElementById("single-country");
let country_name = document.getElementById("country_name");
let country_flag = document.getElementById("country_flag");
let country_date = document.getElementById("country_date");
let country_infected = document.getElementById("country_infected");
let country_deaths = document.getElementById("country_deaths");
let country_recovered = document.getElementById("country_recovered");
let map = document.getElementById("map");
let locations = map.querySelectorAll(`[data-countryid]`);

async function set_single_country_stats(slug){
    single_country.classList.add("reload");

    let info, total, timeline, days;
    // await fetch(`https://api.covid19api.com/total/country/${slug}?from=2020-01-01T00:00:00Z`)
    await fetch(`https://api.thevirustracker.com/free-api?countryTotal=${slug}`)
    .then(response => response.text())
    .then(data => {
        data = clear_json(data);
        console.log(data.results);
        info = data.countrydata[0].info;
        delete data.countrydata[0].info;
        total = data.countrydata[0];
    });

    await fetch(`https://api.thevirustracker.com/free-api?countryTimeline=${slug}`)
    .then(response => response.text())
    .then(data => {
        data = clear_json(data);
        data = data.timelineitems;

        days = Object.keys(data[0]);
        days.splice(-1, 1);

        timeline = json2array(data[0]);
        timeline.splice(-1, 1);
    });
    
    // console.clear();
    // console.log("info", info);
    // console.log("total", total);
    // console.log("timeline", timeline);
    // console.log("days", days);

    // Ustawienie danych (nazwa, flaga)
    country_name.innerText = (info.title) ? info.title : "N/D";
    country_date.innerText = (days[days.length-1]) ? days[days.length-1] : "N/D";
    country_flag.setAttribute("src", return_flag_url(info.code, null, false));

    // // Obecne statystyki
    update_data_counter("country_infected", total.total_cases);
    update_data_counter("country_deaths", total.total_deaths);
    update_data_counter("country_recovered", total.total_recovered);
    update_data_counter("country_infected_today", total.total_new_cases_today);
    update_data_counter("country_deaths_today", total.total_new_deaths_today);
    update_countup();

    // Podjaśnienie mapki
    locations.forEach(function(el){
        let check = (el.dataset.countryid == info.code || el.dataset.countryid.includes(info.title) || el.getAttribute("aria-label").includes(info.title));
        // el.classList.toggle("selected", check);
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
    if( !location_exist ){ document.getElementById("map_redirect").setAttribute("href", `https://www.google.com/maps/place/Country ${info.title}`); }
    else{ zoom_to_country( document.querySelector('#map .map-inner svg .selected') ); }

    // Ustaw wykres
    let latest = {
        "confirmed":[],
        "deaths":[],
        "recovered":[],
        "days": days
    };

    timeline.forEach(function(el){
        latest.confirmed.push(el.total_cases);
        latest.deaths.push(el.total_deaths);
        latest.recovered.push(el.total_recoveries);
    });

    set_chart(latest);

    setTimeout(function(){
        single_country.classList.remove("reload");
    }, 2000);
}


// 
// Set global stats
// 
function set_global_stats(stats){
    // let {Totalconfirmed, Newconfirmed, Totaldeaths, Newdeaths, Totalrecovered, Newrecovered} = stats;
    let {total_cases, total_deaths, total_recovered} = stats;

    update_data_counter("global_infected", total_cases);
    update_data_counter("global_deaths", total_deaths);
    update_data_counter("global_recovered", total_recovered);
}

// 
// Set most and least infected countries
// 
function set_most_least_infected_table(stats){
    let top_max = get_top_max_by_prop(stats, "total_cases", 7);
    let top_min = get_top_min_by_prop(stats, "total_cases", 7, false);

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
function set_country_list(){
    let country_list = document.getElementById("city_search_list");
    let html = "";

    STATS.countries.forEach(function(el){
        let {code, title} = el;
        if( code.toLowerCase() != "dp" ){
            html += `<li class="input-dropdown-item"><a href="#" data-set-view="country" data-params='{"slug":"${code}"}' data-value="${code} ${title}" class="input-dropdown-button"><img src="${return_flag_url(code.toLowerCase())}"/> ${title}</a></li>`;
        }
    });

    country_list.innerHTML = html;

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

    // apply_data_to_table({
    //     id: "infected-list",
    //     stats: STATS.countries,
    //     random: false
    // });

    // Infected list pagination
    acl_set_paginate();


    set_country_list();

    update_set_view_triggers();

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

    await fetch("https://api.thevirustracker.com/free-api?global=stats")
    .then(response => response.text())
    .then(data => {
        data = clear_json(data);
        global = data.results[0];
    })
    .catch(err => console.error("API ERROR: init_stats global |", err));
    
    await fetch("https://api.thevirustracker.com/free-api?countryTotals=ALL")
    .then(response => response.text())
    .then(data => {
        data = clear_json(data);
        countries = data.countryitems[0];
    })
    .catch(err => console.error("API ERROR: init_stats countries |", err));

    return {
        "countries": json2array(countries),
        "global": global
    };
}
let stats = init_stats();
stats.then(data => {
    STATS = data;

    STATS.countries.splice((STATS.countries.length - 1), 1);

    // console.log(STATS);
    
    set_data();
})
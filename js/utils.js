let STATS = null;
let apperance = {
    "safe_eye": 0,
    "dark_theme": false
};

const date_options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour12: false, hour: '2-digit', minute: '2-digit' };
const date_short_options = { day: '2-digit', month: '2-digit', year: 'numeric'};

// 
// Options for countup
// 
const countup_options = {
    separator: ' ',
};

// 
// Generate random ID
// 
function randid(prefix) {
    return ((prefix) ? prefix : '_') + Math.random().toString(36).substr(2, 9);
}

// 
// Return flag
// 
function return_flag_url(slug, callback, check){
    slug = slug.toLowerCase();
    let url = `https://www.countryflags.io/${slug}/flat/64.png`;

    if( check ){
        let image = new Image();
        image.src = url;
        image.onload = function(){
            let u = "";
            if( image.width == 0 ){
                image = null;
                u = "img/empty.png";
            }
            else{
                u = url;
            }
    
            if( typeof(callback) === "function" ){
                callback(u);
            }
        };
    }
    else{
        return url;
    }
}

function lazy_flag_init(){
    let lazy = document.querySelectorAll('[data-lazy-flag]');
    if( lazy.length > 0 ){
        lazy.forEach(function(el){
            let slug = el.dataset.lazyFlag;
            
            return_flag_url(slug, function(url){
                el.setAttribute("src", url);
            }, true);
        });
    }
}


// 
// Random number
// 
function random_range(max_number, max_randomed){
    if( !max_number ){ console.error("max_number is null"); return false; }
    if( !max_randomed ){ console.error("max_randomed is null"); return false; }

    let arr = [];
    while(arr.length < max_randomed){
        let r = Math.floor(Math.random() * max_number);
        if(arr.indexOf(r) === -1) arr.push(r);
    }

    return arr;
}

// 
// Update attribute of data-counter
// 
function update_data_counter(id, val){
    if( !id ){ console.error("Error data-counter: 'id' is empty"); return false; }
    if( !val && val != 0 ){ console.error("Error data-counter: 'val' is empty"); return false; }

    let el = document.querySelector(`[data-counter="${id}"]`);

    if( el ){
        el.setAttribute("data-number", val);
    }
}

// 
// Init/Update countup
// 
let counters = document.querySelectorAll("[data-number]");
let countups = [];
function update_countup(){

    if( countups.length == 0 || countups.length != document.querySelectorAll("[data-number]").length ){
        counters = document.querySelectorAll("[data-number]");
    }

    counters.forEach(function(el){
        let rng = randid("no_");
        let count_to = parseInt(el.getAttribute("data-number"));
        el.setAttribute("id", rng);

        let count = new countUp.CountUp(`${rng}`, Math.floor(count_to / 2), countup_options);
        count.to = count_to;
        countups.push( count );
    });

    setTimeout(function(){
        countups.forEach(function(el, i){
            el.update( el.to );
        });
    }, 100);
}


// 
// Apply data to table
// 
function apply_data_to_table(cfg){
    let html = "";
    let picked_ids = [];
    let def_cfg = {
        id: "",
        stats: {},
        random: false,
        small: false,
        clear: false
    };

    def_cfg = Object.assign(def_cfg, cfg);

    console.log(def_cfg);

    if( def_cfg.id == "" || def_cfg.stats.length == 0 ){ return false; }

    if( def_cfg.random ){
        picked_ids = random_range(def_cfg.stats.length, 20);
    }

    if( def_cfg.clear ){
        document.querySelectorAll(`#${def_cfg.id} .table-row:not(.table-head)`).forEach(function(el){
            el.remove();
        });
    }

    def_cfg.stats.forEach(function(el, i){
        // let {title, code, total_new_cases_today, total_cases, total_new_deaths_today, total_deaths, total_recovered} = el;
        let {name, code, new_cases, cases, new_deaths, deaths, recovered} = el;
        if( code.toLowerCase() != "dp" ){
            let classes = "";

            classes += (def_cfg.random && picked_ids.indexOf(i) === -1) ? " hide" : "";
            classes += (def_cfg.small) ? " small" : "";

            html += `<div class="table-row ${classes}" data-sort-id="${(i+1)}" data-sort-name="${name}" data-sort-infected="${new_cases}" data-sort-deaths="${new_deaths}" data-sort-recovered="${recovered}">`;
                html += `<div class="table-el city">`;
                    html += `<img src="" data-lazy-flag="${code.toLowerCase()}" alt="${name}" class="icon">`;
                    html += `<span><button class="btn-link" data-set-view="country" data-params='{"slug":"${code}"}'>${name}</button></span>`;
                html += `</div>`;
                html += `<div class="table-el infected">${cases} <small>(+${new_cases})</small></div>`;
                html += `<div class="table-el deaths">${deaths} <small>(+${new_deaths})</small></div>`;
                html += `<div class="table-el recovered">${recovered}</div>`;
            html += `</div>`;
        }
    });

    let table = document.getElementById(def_cfg.id);
    if( table ){
        table.insertAdjacentHTML('beforeend', html);
    }
    else{
        console.error("Table " + id + " not exist");
    }

    lazy_flag_init();
}


// 
// Convert JSON to array
// 
function json2array(arr){
    var result = [];
    var keys = Object.keys(arr);
    keys.forEach(function(key){
        result.push(arr[key]);
    });

    return result;
}


// 
// Get country by prop with value
// 
function find_by_prop(arr, prop, val){
    let finded = [];

    for(let i=0; i<arr.length; i++){
        if( arr[i][prop] == val ){
            finded.push(arr[i]);
        }
    }

    return finded;
}


// 
// Get max
// 
function get_max_prop(arr, prop){
    let max;

    for(let i=0; i<arr.length; i++){
        if( parseInt(arr[i][prop]) > parseInt(max[prop]) ){
            max = arr[i];
        }
    }

    return max;
}


// 
// Get min
// 
function get_min_prop(arr, prop){
    let min;

    for(let i=0; i<arr.length; i++){
        if( parseInt(arr[i][prop]) < parseInt(min[prop]) && parseInt(arr[i][prop]) > 1 ){
            min = arr[i];
        }
    }

    return min;
}


// 
// Get max by prop
// 
function get_top_max_by_prop(arr, prop, max){
    let sorted = arr.slice().sort((a, b) => b[prop] - a[prop]);
    sorted = sorted.slice(0, max);

    return sorted;
}

// 
// Get min by prop
// 
function get_top_min_by_prop(arr, prop, max, allowZero = true){
    let sorted = arr.slice().sort((a, b) => a[prop] - b[prop]);

    if( !allowZero ){
        sorted = sorted.filter((item)=>{
            return item[prop] > 0;
        });
    }

    sorted = sorted.slice(0, max);

    return sorted;
}


// 
// Format date
// 
function format_date(d){
    d = d.split("/");
    
    let month = (d[0] < 10) ? "0"+d[0] : d[0];
    let day = (d[1] < 10) ? d[1] : d[1];
    let year = "20"+d[2];

    return `${day}-${month}-${year}`;
}


// 
// Set chart
// 
let country_chart = document.getElementById("country_chart");
let country_chart_ctx = country_chart.getContext('2d');
let chart = null;
function set_chart(stats){
    console.log(stats);
    let i = stats.confirmed || null;
    let d = stats.deaths || null;
    let r = stats.recovered || null;
    let days = stats.days || null;

    if( chart ){
        chart.data.labels = days;

        chart.data.datasets[0].data = i;
        chart.data.datasets[1].data = d;
        chart.data.datasets[2].data = r;

        chart.update();
    }
    else{
        // Set chart
        chart = new Chart(country_chart_ctx, {
            // The type of chart we want to create
            type: 'line',

            // The data for our dataset
            data: {
                labels: days,
                datasets: [
                    {
                        label: 'Infected',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#0b93fb',
                        data: i
                    },
                    {
                        label: 'Deaths',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#e45253',
                        data: d
                    },
                    {
                        label: 'Recovered',
                        backgroundColor: 'rgba(0,0,0,0)',
                        borderColor: '#2f7b63',
                        data: r
                    }
                ]
            },

            // Configuration options go here
            options: {
                responsive: true,
                elements: {
                    point:{
                        radius: 2,
                        hoverRadius: 5,
                        rotation: 45
                    }
                },
                legend:{
                    display: true
                },
                scales:{
                    xAxes: [{
                        afterTickToLabelConversion: function(data){
                            var xLabels = data.ticks;
        
                            xLabels.forEach(function (label, i) {
                                // if ( parseInt(label.split("/")[1]) % 2 != 1){
                                if ( i % 3 != 1){
                                    xLabels[i] = '';
                                }
                            });
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                },
                tooltips:{
                    mode: 'index',
                    axis: 'y'
                }
            }
        });
    }
}


// 
// Zoom map to country
// 
function zoom_to_country(target){
    let wrapper = document.querySelector('#map .map-inner svg');

    wrapper.parentNode.style = `transform: scale(1)`;
    wrapper.style = `transform: translate(0px, 0px)`;

    setTimeout(function(){
        let offset_y = 0, offset_x = 0, scale = 1;

        if( target ){
            let target_box = target.getBoundingClientRect();
            let wrapper_box = wrapper.getBoundingClientRect();
            
            offset_y = ((target_box.top + target_box.height / 2) - (wrapper_box.top + wrapper_box.height / 2)) * (-1);
            offset_x = ((target_box.left + target_box.width / 2) - (wrapper_box.left + wrapper_box.width / 2)) * (-1);
            scale = (wrapper_box.width / wrapper_box.height > target_box.width / target_box.height)  ? wrapper_box.height / target_box.height : wrapper_box.width / target_box.width;

            if( scale > 30 ){
                scale = 30;
            }
        }

        wrapper.style = `transform: translate(${offset_x}px, ${offset_y}px)`;
        wrapper.parentNode.style = `transform: scale(${scale.toFixed(2)});`;
    }, 1500);
}

// 
// URL Params get
// 
function get_params() {
    url = window.location.href;
    let u = new URL(url);
    let params = u.searchParams;

    return params;
}


// 
// Update url in browser
// 
function set_url(url){
    if( !url ){ url = url = window.location.origin; }
    // console.log(url);
    window.history.pushState({"url":url}, document.title, url);
}


// 
// Set view
// 
let set_view_triggers = document.querySelectorAll('[data-set-view]');
let views = document.querySelectorAll('[data-view]');
function set_view(){
    let params = get_params();
    let view = params.get("v");

    views.forEach(function(el){ el.classList.add("hide"); });

    // console.log("View set to: " + view);
    
    switch( view ){
        case "country":{
            let slug = params.get("slug");
            if( slug == "" ){
                set_url("");
                set_view();
            }
            else{
                set_single_country_stats(slug);
            }
            break;
        }
        case "be-safe":{

            break;
        }
        default:
        case "main":
        case "":{
            view = "main";

            zoom_to_country(null);
            break;
        }
    }

    document.querySelectorAll(`[data-view="${view}"]`).forEach(function(el){
        el.classList.remove("hide");
    });
}

// 
// Update list of triggers
// 
function update_set_view_triggers(){
    set_view_triggers = document.querySelectorAll('[data-set-view]');

    set_view_triggers.forEach(function(el){
        el.addEventListener('click', function(e){
            let view = e.target.getAttribute("data-set-view") || e.target.getAttribute("href");
            let params = e.target.getAttribute("data-params") || false;
            let params_uri = "";

            if( params.length ){
                params = JSON.parse(params);
                let k = Object.keys(params);

                k.forEach(function(el){
                    params_uri += `&${el}=${params[el]}`;
                });
            }

            set_url(window.location.origin + window.location.pathname + "?v=" + view + params_uri);
            set_view();

            e.preventDefault();
            return false;
        });
    });
}


// 
// Pagination for array
// 
function paginate_array(opt){
    let to_return;
    let opt_def = {
        page: 1,
        per_page: 5,
        items: {},
    };

    opt_def = Object.assign(opt_def, opt);

    // Cut array
    if( opt_def.items.length > 0 ){
        let start = ((opt_def.page * opt_def.per_page) - opt_def.per_page);
        let end = ((opt_def.page * opt_def.per_page) - 1);
        let cutted = opt_def.items.slice( start, end );
        let total = Math.ceil(opt_def.items.length / opt_def.per_page);

        to_return = {
            items: cutted,
            prev: (start > 0),
            next: (end < opt_def.items.length-1),
            counter: `${opt_def.page}/${total}`
        };
    }
    else{
        to_return = false;
    }

    return to_return;
}


// 
// Change safe eye
// 
let safe_eye_switch = document.getElementById("safe_eye");
function set_safe_eye(){
    safe_eye_switch.querySelector('span').textContent = "("+apperance.safe_eye+")";

    document.body.setAttribute("data-safe-eye", apperance.safe_eye);
}
set_safe_eye();
safe_eye_switch.addEventListener('click', function(){
    apperance.safe_eye = parseInt(apperance.safe_eye) + 1;
    if( apperance.safe_eye > 2 ){ apperance.safe_eye = 0; }

    set_safe_eye();
});


// 
// Change dark-theme
// 
let theme_switch = document.getElementById("theme_switch");
function set_theme(){
    document.body.setAttribute("data-dark", apperance.dark_theme);
}
set_theme();
theme_switch.addEventListener('click', function(){
    apperance.dark_theme = !apperance.dark_theme;

    set_theme();
});


// 
// Clear JSON
// 
let regex = /<br \/>(.*?\n?)*<br \/>/gmi;
function clear_json(res){
    let r = res;
    // r = r.replace(/(\r\n|\n|\r)/gm, '');
    // // r = r.replace(regex, '');
    // console.log(r);

    try{
        r = JSON.parse(r);
    }
    catch(err){
        console.log( err );
    }

    return r;
}
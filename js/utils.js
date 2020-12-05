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
// Notify
// 
let notify_el = document.getElementById("notify");
function notify(type, content, time){
    notify_el.className = "notify";

    if( type ){
        notify_el.className = "notify " + type;
    }

    if( content ){
        notify_el.children[0].innerHTML = content;
    }

    if( time ){
        notify_el.classList.add("show");

        setTimeout(function(){
            notify_el.classList.remove("show");
        }, time);
    }
    else{
        notify_el.classList.add("show");

        setTimeout(function(){
            notify_el.classList.remove("show");
        }, 3000);
    }
}


// 
// Return flag
// 
function return_flag_url(slug, callback, check){
    slug = slug.toLowerCase();
    // let url = `https://www.countryflags.io/${slug}/flat/64.png`;
    let url = `https://flagcdn.com/w160/${slug}.png`;

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
        let {name, code, new_cases, cases, new_deaths, deaths, new_recovered, recovered} = el;
        if( code.toLowerCase() != "dp" ){
            let classes = "";

            classes += (def_cfg.random && picked_ids.indexOf(i) === -1) ? " hide" : "";
            classes += (def_cfg.small) ? " small" : "";

            html += `<div class="table-row ${classes}" data-sort-id="${(i+1)}" data-sort-name="${name}" data-sort-infected="${new_cases}" data-sort-deaths="${new_deaths}" data-sort-recovered="${recovered}">`;
                html += `<div class="table-el city" data-table-name="City:">`;
                    html += `<img src="" data-lazy-flag="${code.toLowerCase()}" alt="${name}" class="icon">`;
                    html += `<span><button class="btn-link" data-set-view="country" data-params='{"slug":"${code}"}'>${name}</button></span>`;
                html += `</div>`;
                html += `<div class="table-el infected" data-table-name="Infected:">${cases} <small>(+${new_cases})</small></div>`;
                html += `<div class="table-el deaths" data-table-name="Deaths:">${deaths} <small>(+${new_deaths})</small></div>`;
                html += `<div class="table-el recovered" data-table-name="Recovered:">${recovered} <small>(+${new_recovered})</small></div>`;
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
    let result = [];
    let keys = Object.keys(arr);
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

let charts = [];

Chart.defaults.LineWithLine = Chart.defaults.line;
Chart.controllers.LineWithLine = Chart.controllers.line.extend({
    draw: function (ease) {
        Chart.controllers.line.prototype.draw.call(this, ease);

        if (this.chart.tooltip._active && this.chart.tooltip._active.length) {
            let activePoint = this.chart.tooltip._active[0],
                ctx = this.chart.ctx,
                x = activePoint.tooltipPosition().x,
                topY = this.chart.legend.bottom,
                bottomY = this.chart.chartArea.bottom;

            // draw line
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(x, topY);
            ctx.lineTo(x, bottomY);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#ddd';
            ctx.stroke();
            ctx.restore();
        }
    }
});

function set_chart(id, stats, custom){
    let chart = charts.find(el => {
        return (el.canvas.getAttribute("id") == id);
    });

    let i = stats.confirmed || null;
    let di = stats.daily_confirmed || null;
    let d = stats.deaths || null;
    let dd = stats.daily_deaths || null;
    let r = stats.recovered || null;
    let dr = stats.daily_recovered || null;
    let days = stats.days || null;

    if( chart ){

        switch( id ){
            case "country_chart":{

                chart.data.labels = days;

                chart.data.datasets[0].data = i;
                chart.data.datasets[1].data = d;
                chart.data.datasets[2].data = r;

                break;
            }
            case "daily":{
                days.pop();
                chart.data.labels = days;
                chart.data.datasets[0].data = di;

                break;
            }
        }

        chart.update();
    }
    else{

        let el_chart = document.getElementById(id);
        let el_chart_ctx = el_chart.getContext('2d');

        let chart_days;
        let chart_datasets;

        switch( id ){
            case "country_chart":{
                chart_days = days;
                chart_datasets = [
                    {
                        label: 'Infected',
                        borderColor: '#0b93fb',
                        backgroundColor: 'rgba(0,0,0,0)',
                        data: i
                    },
                    {
                        label: 'Deaths',
                        borderColor: '#e45253',
                        backgroundColor: 'rgba(0,0,0,0)',
                        data: d
                    },
                    {
                        label: 'Recovered',
                        borderColor: '#2f7b63',
                        backgroundColor: 'rgba(0,0,0,0)',
                        data: r
                    }
                ];

                break;
            }
            case "daily":{
                days.pop();
                chart_days = days;

                chart_datasets = [
                    {
                        label: 'Daily infected',
                        borderColor: '#0b93fb',
                        backgroundColor: '#0b93fb',
                        data: di
                    },
                    {
                        label: 'Daily deaths',
                        borderColor: '#e45253',
                        backgroundColor: '#e45253',
                        data: dd
                    },
                    {
                        label: 'Daily recovered',
                        borderColor: '#2f7b63',
                        backgroundColor: '#2f7b63',
                        data: dr
                    }
                ];

                break;
            }
        }

        // Set chart
        chart = new Chart(el_chart_ctx, {
            // The type of chart we want to create
            type: (custom.type) ? custom.type : 'LineWithLine',

            // The data for our dataset
            data: {
                labels: chart_days,
                datasets: chart_datasets
            },

            // Configuration options go here
            options: {
                responsive: true,
                elements: {
                    line: {
                        tension: 0.4
                    },
                    point:{
                        radius: 0,
                        hoverRadius: 0,
                    }
                },
                legend:{
                    display: (custom.size != "small" && chart_datasets.length > 1) ? true : false,
                },
                tooltips: {
                        mode: (custom.size != "small") ? 'label' : false,
                        axis: 'x',
                        intersect: false
                    },
                    scales: {
                        xAxes: [{
                            display: false,
                        }],
                        yAxes: [{
                            display: (custom.size != "small") ? true : false,
                            scaleLabel: {
                                show: true,
                                labelString: 'Value'
                            },
                            ticks: {
                                min: 0,
                            }
                        }]
                    }
            }
        });

        charts.push(chart);
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

    let params = "{";
    let params_url = window.location.search.substr(1).split("&");
    params_url.forEach(function (item, index) {
        let tmp = item.split("=");

        params += `"${tmp[0]}":"${tmp[1]}"`;

        if( index < params_url.length-1 ){
            params += ",";
        }
    });

    params += "}";

    return JSON.parse(params);
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
function set_view(e){
    let params = get_params();
    // console.log(params);
    let view = (params.v) ? params.v : "main";

    views.forEach(function(el){ el.classList.add("hide"); });

    // console.log("View set to: " + view);
    
    switch( view ){
        case "country":{
            let slug = (params.slug) ? params.slug : "";
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
            e.target.classList.add("hide");

            break;
        }
        case "widget":{

            break;
        }
        default:
        case "main":
        case "":{
            view = "main";

            zoom_to_country(null);

            // Reset be safe
            document.querySelector('[data-set-view="be-safe"]').classList.remove("hide");

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
            set_view(e);

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
// Update widget triggers
// 
function update_widget_triggers(){
    widget_triggers = document.querySelectorAll('[data-widget]');

    widget_triggers.forEach(function(el){
        el.addEventListener('click', function(e){
            e.target.setAttribute("disabled", "disabled");

            let id = "";
            if( e.target.getAttribute("id") ){
                id = randid("copy_");
                e.target.setAttribute("id", rid);
            }
            else{ id = e.target.getAttribute("id"); }

            let tmp_txt = e.target.innerHTML;
            
            let type = e.target.getAttribute("data-widget") || false;
            let size = e.target.getAttribute("data-widget-size") || false;
            let country = (type == "country") ? get_params().slug : "";

            let width = 0;
            let height = 0;

            let url = window.location.href.replace(window.location.search, "") + "widget/index.html";

            width = (size == "small") ? 320 : 640;

            if( type == "global" ){
                height = (size == "big") ? 255 : 310;

                url += `?type=global`;
            }
            else if( type == "country" ){
                height = (size == "big") ? 270 : 350;

                url += `?type=country&slug=${country}`;
            }

            let iframe = `<iframe src="${url}" width="${width}" height="${height}" frameborder="0"></iframe>`;

            if (!navigator.clipboard) {
                notify("error", "Sorry, your web browser or device not support clipboard, try copy manually code below\n" + iframe, 10000);
                return;
            }

            setTimeout(function(){
                e.target.innerHTML = tmp_txt;
                e.target.removeAttribute("disabled");
            }, 2000);
    
            try {
                navigator.clipboard.writeText(iframe);

                notify("success", "Widget copy to clipboard!", 2000);
                
                e.target.innerHTML = "Copied!";
            } catch (error) {
                console.error("copy failed", error);
            }
        });
    });
}


// 
// Change dark-theme
// 
let theme_switch = (document.getElementById("theme_switch")) ? document.getElementById("theme_switch") : false;
function set_theme(){
    document.body.setAttribute("data-dark", apperance.dark_theme);
}
set_theme();

if( theme_switch ){
    theme_switch.addEventListener('click', function(){
        apperance.dark_theme = !apperance.dark_theme;
    
        theme_switch.querySelector("i").className = (apperance.dark_theme) ? "fas fa-sun" : "fas fa-moon" ;
    
        set_theme();
    });
}


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
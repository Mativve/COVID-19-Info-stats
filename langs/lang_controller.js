let lang_selected = "pl";
const lang_arr = [
    {
        "slug":"pl",
        "title":"Polski",
        "locale": 'pl-PL'
    },
    {
        "slug":"us",
        "title":"English",
        "locale": 'en-US'
    }
];
const lang_available = lang_arr.map(({slug}) => { return slug; });
const lang_cache = {"lang":{}};

// Get country translate
function get_country(code){
    code = code.toUpperCase();

    let c = lang_cache.lang.countries[code];

    return c;
}

// Get locale shortcut (pl_PL, en_US etc)
function get_locale(){
    const loc = lang_arr.find((el) => {
        return (el.slug == lang_selected);
    });

    return loc.locale;
}

// After load lang file save it to variable
function set_lang(cat){
    if( lang_cache.lang[cat] ){
        let txt = lang_cache.lang[cat];

        return txt;
    }
    else{
        console.info(`[lang_cache][${cat}] not found!`);
    }
}

// Apply lang to element
function set_lang_el(el, {cat, target}){
    if( lang_cache.lang[cat] ){
        let txt = lang_cache.lang[cat];

        console.info(`[lang_cache][${cat}] founded!`);

        switch( target ){
            default:
            case "this":{

                if( el ){
                    el.innerHTML = txt;
                }
                else{
                    return txt;
                }

                break;
            }
            case "placeholder":{

                if( el ){
                    el.setAttribute("placeholder", txt);
                }
                else{
                    return txt;
                }

                break;
            }
            case "country":{
                txt = get_country(cat);

                if( el ){
                    el.innerHTML = txt;
                }
                else{
                    return txt;
                }

                break;
            }
        }
    }
    else{
        console.info(`[lang_cache][${cat}] not found!`);
    }
}

// Init setting translation to all item with [data-lang] attribute
let lang_el = document.querySelectorAll('[data-lang]');
function apply_langs(){
    lang_el = document.querySelectorAll('[data-lang]');

    lang_el.forEach((el) => {
        let cat = el.dataset.lang;
        let target = el.dataset.langTarget;

        set_lang_el(el, {"cat":cat, "target":target});
    });

    // Chart JS
    if( charts.length ){
        charts.forEach(function(chart){
            const id = chart.canvas.getAttribute("id");

            switch( id ){
                case "country_chart":{
                    chart.data.datasets[0].label = set_lang('infected');
                    chart.data.datasets[1].label = set_lang('deaths');
                    chart.data.datasets[2].label = set_lang('recovered');

                    break;
                }
                case "daily":{
                    chart.data.datasets[0].label = set_lang('infected') + ' ' + set_lang('daily');
                    chart.data.datasets[1].label = set_lang('deaths') + ' ' + set_lang('daily');
                    chart.data.datasets[2].label = set_lang('recovered') + ' ' + set_lang('daily');

                    break;
                }
                case "daily_percentage":{
                        chart.data.datasets[0].label = set_lang('infected') + ' ' + set_lang('daily') + ' (%)';
                        chart.data.datasets[1].label = set_lang('deaths') + ' ' + set_lang('daily') + ' (%)';
                        chart.data.datasets[2].label = set_lang('recovered') + ' ' + set_lang('daily') + ' (%)';
                    break;
                }
            }

            chart.update();
        });
    }

    // Update View
    let { slug } = get_params();
    if( slug ){
        set_view();
    }
}

// 
async function load_lang(){
    await fetch(`langs/${lang_selected}.json`)
    .then(response => response.json())
    .then((data)=> {
        lang_cache.lang = data;

        apply_langs();
    });
}


// Lang panel
let lang_panel_activator = document.querySelector('.lang-activator');

function lang_panel_activator_update(){
    let ln = lang_arr.findIndex((el) => { return (el.slug == lang_selected); });
    ln++;

    if( ln > lang_arr.length-1 ){ ln = 0; }

    let {slug, title} = lang_arr[ln];

    lang_panel_activator.innerHTML = `<img src="https://flagcdn.com/w160/${slug}.png" alt="${title}"/>${title}`;
    lang_panel_activator.dataset.selectLang = slug;
}

// Lang save/load to localStorage
function lang_ls_save(){
    localStorage.setItem("lang", lang_selected);
}

function lang_ls_load(){
    let first_lang = ( lang_available.includes(window.navigator.language) ) ? window.navigator.language : "us";
    lang_selected = (localStorage.getItem("lang")) ? localStorage.getItem("lang") : first_lang;
}


// Lang events (click etc)
function lang_events(){
    lang_panel_activator = document.querySelector('.lang-activator');

    lang_panel_activator.addEventListener('click', async function(e){
        lang_panel_activator.setAttribute("disabled", "disabled");

        let lang = lang_panel_activator.dataset.selectLang;

        lang_selected = lang;
        lang_ls_save();

        await load_lang().then(function(){
            lang_panel_activator_update();

            lang_panel_activator.removeAttribute("disabled");
        });
    });
}


// 
async function lang_init(){
    lang_ls_load();

    await load_lang();
    apply_langs();

    lang_panel_activator_update();
    lang_events();
}
lang_init();
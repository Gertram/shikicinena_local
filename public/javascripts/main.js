async function request(url, params = {}, method = 'GET') {
    let options = {
        method
    };
    if ('GET' === method) {
        url += '?' + (new URLSearchParams(params)).toString();
    } else {
        options.body = JSON.stringify(params);
    }
    let res = await fetch(url, options);
    return await res.json();
}

function request_submit() {
    try {
        const search = document.getElementById('search');
        const link = new URL(search.value);
        const path = link.pathname;
        const match = path.match(/\/*\/(?<id>[a-zA-Z0-9]+)-.*/);
        const shiki_id = match.groups['id'];
        showAnime(shiki_id).then(x => {

        }).catch(error => {
            console.error(error)
        })
    } catch (error) {
        console.error(error);
    }
    return false;
}

function first(obj){
    return obj[Object.keys(obj)[0]]
}

function lastKey(obj){
    return Object.keys(obj)[Object.keys(obj).length-1];
}
function firstKey(obj){
    return Object.keys(obj)[0];
}

async function showAnime(shiki_id, episode_id = null,voice_id = null) {
    let res = await request('https://kodikapi.com/search', {
        'token': '8e329159687fc1a2f5af99a50bf57070',
        'shikimori_id': shiki_id.toString(),
        'with_episodes': 'true'
    })
    res = res.results;
    if (res.length === 0) {
        return;
    }
    let voice = res[0];
    if(voice_id != null) {
        for (let item in res) {
            item = res[item];
            if (item.translation.id == voice_id) {
                voice = item;
            }
        }
    }else{
        voice_id = voice.translation.id;
    }

    const season = first(voice.seasons);
    let episode = season.link;
    if(episode_id != null && season.episodes[episode_id] !== undefined){
        episode = season.episodes[episode_id];
    }else{
        episode_id = 1;
    }
    window.history.pushState(null,null,'/animes/'+shiki_id+'/episodes/'+episode_id+'/voices/'+voice_id);
    const root = document.getElementById('root');

    root.innerHTML = '<div id="video_wrap"><iframe id="video_root" src="' + episode + '"></iframe></div>';
    document.getElementById('other').style.display = 'flex';

    const prev_button = document.getElementById('button_prev');
    const next_button = document.getElementById('button_next');
    const ep_info = document.getElementById('episode_info');
    const prev_clone = prev_button.cloneNode(true);
    const next_clone = next_button.cloneNode(true);
    const ep_info_clone = ep_info.cloneNode(true);
    prev_button.replaceWith(prev_clone)
    next_button.replaceWith(next_clone)
    ep_info.replaceWith(ep_info_clone)
    episode_id = parseInt(episode_id);
    if(episode_id > parseInt(firstKey(season.episodes))){
        prev_clone.onclick = function(){
            showAnime(shiki_id,(episode_id-1).toString(),voice_id);
        }
    }
    ep_info_clone.onchange = function(){
        const id = parseInt(ep_info_clone.value);
        if(id < parseInt(firstKey(season.episodes)) || id > parseInt(lastKey(season.episodes))){
            return;
        }
        showAnime(shiki_id,id.toString(),voice_id);
    }
    if(episode_id < parseInt(lastKey(season.episodes))){
        next_clone.onclick = function (){
            showAnime(shiki_id,(episode_id+1).toString(),voice_id);
        }
    }
    document.getElementById('episode_info').value = episode_id;

}

window.onload = async() => {
    document.getElementById('other').style.display = 'none';
    const url = new URL(document.URL);
    const path = url.pathname;
    const match = path.match(/\/animes\/(?<anime_id>[a-zA-Z0-9]+)(\/episodes\/(?<episode_id>[a-zA-Z0-9]+))?(\/voices\/(?<voice_id>[a-zA-Z0-9]+))?/);
    if (match == null) {
        const form = document.getElementById('request');
        form.onsubmit = request_submit;
        return;
    }
    const anime_id = match.groups['anime_id'];
    const episode_id = match.groups['episode_id'];
    const voice_id = match.groups['voice_id'];
    await showAnime(anime_id,episode_id,voice_id);
};
/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.  The function is async show it
 *       will be returning a promise.
 *
 *   - Returns an array of objects. Each object should include
 *     following show information:
 *    {
        id: <show id>,
        name: <show name>,
        summary: <show summary>,
        image: <an image from the show data, or a default imege if no image exists, (image isn't needed until later)>
      }
 */
async function searchShows(query) {
  // TODO: Make an ajax request to the searchShows api.  Remove
  // hard coded data.
  const url = 'http://api.tvmaze.com/search/shows'
  let res = await axios.get(url,{params:{q: query}})

  
  let shows= res.data.map((show)=>show.show);
  console.log(shows.length)
  if(shows.length===0){
    alert(`No movies found for '${query}'`)
  }
  return shows;
}



/** Populate shows list:
 *     - given list of shows, add shows to DOM
 */

async function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    let img;
    try{
      let imgs= await axios.get(`http://api.tvmaze.com/shows/${show.id}/images`)
      img = imgs.data.filter((img)=> img.main)[0].resolutions.original.url;
    }
    catch{
      img ='https://tinyurl.com/tv-missing'
    }



    let $item = $(
    `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class="card" data-show-id="${show.id}">
          <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <img class="card-img-top" src="${img}">
            <p class="card-text">${show.summary}</p>
          <button id='epsiodes' type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalLong">
                Episodes
            </button>
          </div>
        </div>
      </div>
      `);

    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - hide episodes area
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  evt.preventDefault();

  let query = $("#search-query").val();
  if (!query) return;

  $("#episodes-area").hide();

  const shows = await searchShows(query);
  populateShows(shows);
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  const url=`http://api.tvmaze.com/shows/${id}/episodes`;
  const res = await axios.get(url);
  const episodes = res.data.map((ep)=>({
    id: ep.id,
    name:ep.name,
    season:ep.season,
    number:ep.number

  }))
  return episodes;
}

// given an id it will use getEpisodes 
// to create dom elements for the episode section

async function populateEpisodes(id){
  const $episodeList =$('#episodes-list');
  $episodeList.empty();
  const episodes= await getEpisodes(id);
  for(let episode of episodes){
    let{id, name,season,number}=episode;
    $episodeList.append(`<li>${name} (season ${season}, Episode${number})</li>`)
  }
}

$('#shows-list').on('click', 'button',(e)=>{
  const target = $(e.target);
  populateEpisodes(target.parent().parent().data('show-id'));
  const title = target.parent().find('h5').text();
  $('#episodes-titles').text(`Episodes of ${title}:`)
})
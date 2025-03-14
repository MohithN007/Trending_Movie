import React, { useEffect,useState } from 'react'
import Search from './components/search'
import Spinner from './spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL='https://api.themoviedb.org/3';
const API_KEY=import.meta.env.TMDB_API_KEY;
console.log(API_KEY)

const API_OPTIONS={
  method:'GET',
  headers:{
    accept:'application/json',
    Authorization:`Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJjZmMwYjliN2MyMjk2YTAxYzIxZWE0MDNjOTE3MjJkYiIsIm5iZiI6MTc0MTgyMjcxMC43MjgsInN1YiI6IjY3ZDIxYWY2NzZhOWQ3MzQ2NzgxMWI1ZiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.k-54QqHFNa_AjCp8giWbbibuQckntJEKkDJpUURDuQk`
  }
}
const useDebouncedValue = (inputValue, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(inputValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, delay]);

  return debouncedValue;
};

const App = () => {
  let initialState=" "
  const[searchTerm,setSearchTerm]=useState(initialState);
const[errorMessage,setErrorMessage]=useState(initialState="");
const [movieList,setMovieList]=useState(initialState=[])
const [isLoading,setIsLoading]=useState(initialState=false)
const [trendingMovies,setTrendingMovies]=useState(initialState=[])


const debouncedSearchTerm = useDebouncedValue(searchTerm, 500);


  const fetchMovies=async(query='')=>{
    setIsLoading(true)
    setErrorMessage('')

  try{
    const endpoint=query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
    : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
    const response=await fetch(endpoint,API_OPTIONS)
 
  if(!response.ok){
    throw new Error('Failed to fetch movies')
  }const data=await response.json()
  if(data.response=='False'){
    setErrorMessage(data.Error || 'Failed to fetch movies')
  setMovieList([])
  return
  }
  setMovieList(data.results || [])
if(query && data.results.length>0){
  await updateSearchCount(query,data.results[0])
}

  }
  catch(error){
    console.error(`Error Fetching movies:${error}`);
setErrorMessage('Error fetching movies.Please try again later')
  }
  finally{
    setIsLoading(false)


  }
  }
  const loadTrendingMovies = async() =>{
    try{
      const movies=await getTrendingMovies();
      setTrendingMovies(movies)

    }catch(error){
      console.log(`Error fetching trending movies:${error}`);
    



    }

  }



  
  let deps=[]

  useEffect(() => {
    fetchMovies(debouncedSearchTerm);
},deps=[debouncedSearchTerm]);

useEffect(()=>{
  loadTrendingMovies();},deps=[]
)

  return (
    <main>
    <div className='pattern'>
      <div className='wrapper'>
      <header>
       
    
    
          <img src="\hero.png" alt="Hero Banner"></img>
          <h1>Find<span className='text-gradient'> Movies</span> You'll Enjoy</h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        { (trendingMovies.length) > 0 && (<section className='trending'>
          <h2>Trending Movies</h2>
          <ul>
            {trendingMovies.map((movie,index) => (
              <li key={movie.$id}>
                <p>{index+1}</p><img src={movie.poster_url} alt={movie.title}/>
              </li>
            ))}
          </ul>
        </section>)}
        <section className='all-movies'>
          <h2 >All Movies</h2>
          {isLoading ? (<div className='text-white'><Spinner /></div>) :
          errorMessage?(<p className='text-red-500'>{errorMessage}</p>):
          (<ul>
            {movieList.map((movie)=>(
              <p key={movie.id} className='text-white'><MovieCard  key={movie.id} movie={movie}/></p>
            ))}
          </ul>)}
        </section>
       
        
     
       
      </div>
  
  </div>
  </main>)
}

export default App
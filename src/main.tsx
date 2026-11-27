import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
import {Story} from './Story';
import './style.css';
function Root(){
 const [story,setStory]=useState(location.hash==='#story');
 useEffect(()=>{const f=()=>{setStory(location.hash==='#story');window.scrollTo(0,0);};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f);},[]);
 useEffect(()=>{document.title=story?'I built Flat Hunt because a nice balcony wipes your memory':'Flat Hunt';},[story]);
 return story?<Story/>:<App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);

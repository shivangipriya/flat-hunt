import React,{useEffect,useState,lazy,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {App} from './App';
const Story=lazy(()=>import('./Story').then(m=>({default:m.Story})));
import './style.css';
function Root(){
 const [story,setStory]=useState(location.hash==='#story');
 useEffect(()=>{const f=()=>{setStory(location.hash==='#story');window.scrollTo(0,0);};addEventListener('hashchange',f);return()=>removeEventListener('hashchange',f);},[]);
 useEffect(()=>{document.title=story?'Everyone Remembers the Balcony. Nobody Remembers the Deposit.':'Flat Hunt';},[story]);
 return story?<Suspense fallback={<div className="fh-app" style={{padding:24}}>Loading the story...</div>}><Story/></Suspense>:<App/>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><Root/></React.StrictMode>);
